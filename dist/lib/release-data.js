import { HEAD_REF } from '../constants/git.js';
/**
 * Associate release commits with pull requests from branch metadata or the API.
 * WHY: A HEAD release may itself be a pull request. In that case its branch PR
 * is authoritative for every commit and avoids misleading per-commit matches.
 * @param params Repository, release, commit, and lookup inputs.
 * @returns Pull request references keyed by commit SHA.
 */
export async function resolvePullRequestsBySha({ deps, owner, repo, releaseRef, repoPath, token, githubApiBase, commitList, }) {
    const commitShas = commitList.map((commit) => commit.sha);
    const branchName = releaseRef === HEAD_REF ? deps.currentBranch(repoPath) : null;
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
/**
 * Resolve release notes from the CLI first, then GitHub when a tag is present.
 * @param params CLI, repository, and GitHub lookup inputs.
 * @returns Release notes body, or an empty string when none can be resolved.
 */
export async function resolveReleaseBody(params) {
    if (params.cli.releaseBody)
        return params.cli.releaseBody;
    if (!params.cli.releaseTag)
        return '';
    return params.deps.fetchReleaseBody(params.owner, params.repo, params.cli.releaseTag, params.token, params.githubApiBase);
}
