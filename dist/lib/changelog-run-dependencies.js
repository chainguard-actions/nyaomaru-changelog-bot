import { commitsInRange, currentBranch, gitMergedPRs, tryFindPullRequestNumberForBranch, } from './git.js';
import { writeChangelog } from './changelog.js';
import { createPR } from './pr.js';
import { fetchPRDetails, fetchPullRequestsForBranch, fetchReleaseBody, mapCommitsToPrs, } from './github.js';
import { ensureGithubTokenRequired } from '../schema/env.js';
import { getProviderRuntimeConfig } from './app-config.js';
import { providerFactory } from '../utils/provider.js';
import { getRepoFullName } from '../utils/repository.js';
import { buildChangelogLlmOutput } from '../utils/llm-output.js';
import { prepareExistingChangelog, resolveReleasePlan, resolveRunCredentials, } from './release-context.js';
import { finalizeChangelogUpdate } from './changelog-update.js';
import { resolveCustomInstructionsWithDiagnostics } from './customization.js';
import { buildPrMapBySha, buildTitleToPr } from '../utils/pr-mapping.js';
import { runWhyExtraction } from './why-extraction.js';
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
