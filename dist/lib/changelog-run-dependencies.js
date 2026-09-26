import { commitsInRange, currentBranch, gitMergedPRs, tryFindPullRequestNumberForBranch, } from '../lib/git.js';
import { writeChangelog } from '../lib/changelog.js';
import { createPR } from '../lib/pr.js';
import { fetchPRDetails, fetchPullRequestsForBranch, fetchReleaseBody, mapCommitsToPrs, } from '../lib/github.js';
import { ensureGithubTokenRequired } from '../schema/env.js';
import { getProviderRuntimeConfig } from '../lib/app-config.js';
import { providerFactory } from '../utils/provider.js';
import { getRepoFullName } from '../utils/repository.js';
import { buildChangelogLlmOutput } from '../utils/llm-output.js';
import { prepareExistingChangelog, resolveReleasePlan, resolveRunCredentials, } from '../lib/release-context.js';
import { finalizeChangelogUpdate } from '../lib/changelog-update.js';
import { resolveCustomInstructionsWithDiagnostics } from '../lib/customization.js';
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
/**
 * Merge dependency overrides with the production changelog workflow adapters.
 * @param overrides Partial adapters supplied by tests or alternate runtimes.
 * @returns Complete dependency set for one changelog run.
 */
export function resolveChangelogRunDependencies(overrides = {}) {
    return { ...defaultDependencies, ...overrides };
}
