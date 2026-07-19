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
import { resolveCustomInstructions } from '../lib/customization.js';
import { formatDryRunDiagnostics, formatDryRunJsonReport, } from '../utils/dry-run-diagnostics.js';
import { DEFAULT_PR_LABELS, PR_BRANCH_PREFIX, PR_TITLE_PREFIX, } from '../constants/changelog.js';
import { buildPrMapBySha, buildTitleToPr } from '../utils/pr-mapping.js';
import { runWhyExtraction } from '../lib/why-extraction.js';
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
    resolveCustomInstructions,
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
    const branchName = releaseRef === 'HEAD' ? deps.currentBranch(repoPath) : null;
    const branchPullRequests = branchName
        ? await deps.fetchPullRequestsForBranch(owner, repo, branchName, token, appConfig.github.apiBase)
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
    const apiPrMap = authoritativePullRequests.length
        ? Object.fromEntries(commitShas.map((commitSha) => [commitSha, authoritativePullRequests]))
        : await deps.mapCommitsToPrs(owner, repo, commitShas, token, appConfig.github.apiBase);
    let releaseBody = cli.releaseBody || '';
    if (!releaseBody && cli.releaseTag) {
        releaseBody = await deps.fetchReleaseBody(owner, repo, cli.releaseTag, token, appConfig.github.apiBase);
    }
    const prMapBySha = deps.buildPrMapBySha({
        commitList,
        prsLog: prs,
        repoPath,
        apiPrMap,
    });
    const titleToPr = deps.buildTitleToPr(commitList, prs, prMapBySha);
    const customInstructions = deps.resolveCustomInstructions({
        instructions: cli.instructions,
        instructionsFile: cli.instructionsFile,
        repoPath,
    });
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
        log('==== DRY RUN (no PR) ====');
        const diagnosticsInput = {
            providerName: provider.name,
            modelName: providerConfig.model,
            aiUsed: llmOutput.aiUsed || whyOutput.diagnostics.aiUsed,
            fallbackReasons: llmOutput.fallbackReasons,
            why: whyOutput.diagnostics,
        };
        log(cli.dryRunJsonReport
            ? formatDryRunJsonReport(diagnosticsInput)
            : formatDryRunDiagnostics(diagnosticsInput));
        log('');
        log(updated);
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
