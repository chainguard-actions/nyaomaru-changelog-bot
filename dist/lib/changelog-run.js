import { currentBranch, gitMergedPRs, commitsInRange, tryFindPullRequestNumberForBranch, } from '../lib/git.js';
import { writeChangelog } from '../lib/changelog.js';
import { createPR } from '../lib/pr.js';
import { fetchPRDetails, fetchPullRequestsForBranch, mapCommitsToPrs, fetchReleaseBody, } from '../lib/github.js';
import { ensureGithubTokenRequired } from '../schema/env.js';
import { getProviderRuntimeConfig } from '../lib/app-config.js';
import { providerFactory } from '../utils/provider.js';
import { getRepoFullName } from '../utils/repository.js';
import { buildChangelogLlmOutput } from '../utils/llm-output.js';
import { prepareExistingChangelog, resolveReleasePlan, resolveRunCredentials, } from '../lib/release-context.js';
import { finalizeChangelogUpdate } from '../lib/changelog-update.js';
import { resolveCustomInstructionsWithDiagnostics } from '../lib/customization.js';
import { formatDryRunDiagnostics, formatDryRunJsonReport, } from '../utils/dry-run-diagnostics.js';
import { DEFAULT_PR_LABELS, PR_BRANCH_PREFIX, PR_TITLE_PREFIX, } from '../constants/changelog.js';
import { buildPrMapBySha, buildTitleToPr } from '../utils/pr-mapping.js';
import { runWhyExtraction } from '../lib/why-extraction.js';
/**
 * Explain whether prompt customization affected the generated changelog.
 * @param input Customization resolution and provider execution state.
 * @returns Stable dry-run reason text.
 */
function getPromptCustomizationReason(input) {
    if (!input.requested)
        return 'not requested';
    if (!input.resolved)
        return 'no usable instructions after normalization';
    if (input.noAi)
        return 'not applied because --no-ai skips provider generation';
    if (!input.hasProviderKey) {
        return 'not applied because provider API key is missing';
    }
    if (!input.aiUsed) {
        return 'not applied because provider generation did not complete';
    }
    return 'applied to provider full generation';
}
const defaultDependencies = {
    providerFactory,
    getRepoFullName,
    resolveReleasePlan,
    gitMergedPRs,
    commitsInRange,
    currentBranch,
    tryFindPullRequestNumberForBranch,
    prepareExistingChangelog,
    resolveRunCredentials,
    mapCommitsToPrs,
    fetchReleaseBody,
    fetchPRDetails,
    fetchPullRequestsForBranch,
    resolveCustomInstructionsWithDiagnostics,
    buildPrMapBySha,
    buildTitleToPr,
    getProviderRuntimeConfig,
    buildChangelogLlmOutput,
    finalizeChangelogUpdate,
    runWhyExtraction,
    writeChangelog,
    ensureGithubTokenRequired,
    createPR,
};
async function resolvePullRequestsBySha({ deps, owner, repo, releaseRef, repoPath, token, githubApiBase, commitList, commitShas, }) {
    const branchName = releaseRef === 'HEAD' ? deps.currentBranch(repoPath) : null;
    const branchPullRequests = branchName
        ? await deps.fetchPullRequestsForBranch(owner, repo, branchName, token, githubApiBase)
        : [];
    const remotePrNumber = branchName && branchPullRequests.length === 0
        ? deps.tryFindPullRequestNumberForBranch(branchName, repoPath)
        : null;
    const oldestCommit = commitList[commitList.length - 1];
    const remotePullRequest = remotePrNumber && oldestCommit
        ? {
            number: remotePrNumber,
            title: oldestCommit.subject,
            url: `https://github.com/${owner}/${repo}/pull/${remotePrNumber}`,
        }
        : null;
    const authoritativePullRequests = branchPullRequests.length
        ? branchPullRequests
        : remotePullRequest
            ? [remotePullRequest]
            : [];
    if (authoritativePullRequests.length) {
        return Object.fromEntries(commitShas.map((commitSha) => [commitSha, authoritativePullRequests]));
    }
    return deps.mapCommitsToPrs(owner, repo, commitShas, token, githubApiBase);
}
async function resolveReleaseBody(params) {
    if (params.cli.releaseBody)
        return params.cli.releaseBody;
    if (!params.cli.releaseTag)
        return '';
    return params.deps.fetchReleaseBody(params.owner, params.repo, params.cli.releaseTag, params.token, params.githubApiBase);
}
function writeDryRunOutput(params) {
    const { cli, log, providerName, modelName, changelogAiUsed, fallbackReasons, customInstructionsResolution, customInstructions, hasProviderKey, whyDiagnostics, updated, } = params;
    log('==== DRY RUN (no PR) ====');
    const diagnosticsInput = {
        providerName,
        modelName,
        aiUsed: changelogAiUsed || whyDiagnostics.aiUsed,
        fallbackReasons,
        promptCustomization: {
            ...customInstructionsResolution.diagnostics,
            applied: Boolean(customInstructions && changelogAiUsed && !cli.noAi),
            reason: getPromptCustomizationReason({
                requested: customInstructionsResolution.diagnostics.requested,
                resolved: customInstructionsResolution.diagnostics.resolved,
                noAi: cli.noAi,
                hasProviderKey,
                aiUsed: changelogAiUsed,
            }),
        },
        why: whyDiagnostics,
    };
    log(cli.dryRunJsonReport
        ? formatDryRunJsonReport(diagnosticsInput)
        : formatDryRunDiagnostics(diagnosticsInput));
    log('');
    log(updated);
}
/**
 * Execute the changelog generation workflow for already-parsed CLI options.
 * WHY: Keeping orchestration here makes `runCli` small and gives tests a seam
 * for replacing shell/network dependencies.
 * @param params CLI options, app config, optional logger, and optional dependency overrides.
 * @returns Promise that resolves after dry-run output or PR creation completes.
 */
export async function executeChangelogRun(params) {
    const { cli, appConfig, log = console.log } = params;
    const deps = { ...defaultDependencies, ...params.deps };
    const provider = deps.providerFactory(cli.provider, appConfig.providers);
    const { owner, repo, repoPath, changelogPath, releaseRef, version, prevRef, date, } = deps.resolveReleasePlan(cli, deps.getRepoFullName(appConfig));
    const prs = deps.gitMergedPRs(prevRef, releaseRef, repoPath);
    const existing = deps.prepareExistingChangelog(changelogPath, version);
    const commitList = deps.commitsInRange(prevRef, releaseRef, repoPath);
    const commitShas = commitList.map((commit) => commit.sha);
    const { token, hasProviderKey } = await deps.resolveRunCredentials(provider.name, owner, repo, appConfig);
    const apiPrMap = await resolvePullRequestsBySha({
        deps,
        owner,
        repo,
        releaseRef,
        repoPath,
        token,
        githubApiBase: appConfig.github.apiBase,
        commitList,
        commitShas,
    });
    const releaseBody = await resolveReleaseBody({
        cli,
        deps,
        owner,
        repo,
        token,
        githubApiBase: appConfig.github.apiBase,
    });
    const prMapBySha = deps.buildPrMapBySha({
        commitList,
        prsLog: prs,
        repoPath,
        apiPrMap,
    });
    const titleToPr = deps.buildTitleToPr(commitList, prs, prMapBySha);
    const customInstructionsResolution = deps.resolveCustomInstructionsWithDiagnostics({
        instructions: cli.instructions,
        instructionsFile: cli.instructionsFile,
        repoPath,
    });
    const customInstructions = customInstructionsResolution.instructions;
    const providerConfig = deps.getProviderRuntimeConfig(appConfig, provider.name);
    const llmOutput = await deps.buildChangelogLlmOutput({
        owner,
        repo,
        version,
        date,
        releaseRef,
        prevRef,
        releaseBody,
        language: cli.language,
        customInstructions,
        existingChangelog: existing,
        commitList,
        prs,
        prMapBySha,
        pullRequestsBySha: apiPrMap,
        titleToPr,
        provider,
        providerConfig,
        hasProviderKey,
        token,
        githubApiBase: appConfig.github.apiBase,
        noAi: cli.noAi,
        requireProvider: cli.requireProvider,
        failOnLlmError: cli.failOnLlmError,
    });
    let llm = llmOutput.llm;
    let finalizedUpdate = deps.finalizeChangelogUpdate({
        owner,
        repo,
        version,
        prevRef,
        releaseRef,
        existing,
        llm,
        titleToPr,
    });
    llm = finalizedUpdate.llm;
    let updated = finalizedUpdate.updated;
    const whyOutput = await deps.runWhyExtraction({
        cli,
        llm,
        provider,
        hasProviderKey,
        owner,
        repo,
        token,
        githubApiBase: appConfig.github.apiBase,
        fetchPRDetails: deps.fetchPRDetails,
    });
    if (whyOutput.llm !== llm) {
        finalizedUpdate = deps.finalizeChangelogUpdate({
            owner,
            repo,
            version,
            prevRef,
            releaseRef,
            existing,
            llm: whyOutput.llm,
            titleToPr,
        });
        llm = finalizedUpdate.llm;
        updated = finalizedUpdate.updated;
    }
    if (cli.dryRun) {
        writeDryRunOutput({
            cli,
            log,
            providerName: provider.name,
            modelName: providerConfig.model,
            changelogAiUsed: llmOutput.aiUsed,
            fallbackReasons: llmOutput.fallbackReasons,
            customInstructionsResolution,
            customInstructions,
            hasProviderKey,
            whyDiagnostics: whyOutput.diagnostics,
            updated,
        });
        return;
    }
    deps.ensureGithubTokenRequired(cli.dryRun, token);
    const ghToken = token;
    deps.writeChangelog(changelogPath, updated);
    const branch = `${PR_BRANCH_PREFIX}${version}`;
    const prNum = await deps.createPR({
        owner,
        repo,
        baseBranch: cli.baseBranch,
        branchName: branch,
        title: llm.pr_title || `${PR_TITLE_PREFIX}${version}`,
        body: llm.pr_body || '',
        labels: llm.labels ?? [...DEFAULT_PR_LABELS],
        token: ghToken,
        changelogEntry: cli.changelogPath,
    });
    log(`Created PR #${prNum}`);
}
