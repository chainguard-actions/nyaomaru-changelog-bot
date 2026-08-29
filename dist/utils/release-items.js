import { stripConventionalPrefix } from '../utils/title-normalize.js';
/**
 * Build release items from authoritative commit-to-PR associations.
 * WHY: HEAD may have no release body, while its commits already belong to an
 * open PR whose title and author are the stable parent changelog item.
 * @param commits Commits included in the release range.
 * @param pullRequestsBySha Pull request metadata keyed by commit SHA.
 * @returns PR-level and unmapped commit items, or an empty array without PR metadata.
 */
export function buildReleaseItemsFromPullRequests(commits, pullRequestsBySha) {
    if (commits.length === 0)
        return [];
    const items = [];
    const itemsByPrNumber = new Map();
    let foundPullRequest = false;
    for (const commit of commits) {
        const pullRequest = pullRequestsBySha[commit.sha]?.find((candidate) => candidate.title?.trim());
        if (!pullRequest?.title) {
            items.push({
                title: stripConventionalPrefix(commit.subject),
                rawTitle: commit.subject,
            });
            continue;
        }
        foundPullRequest = true;
        let item = itemsByPrNumber.get(pullRequest.number);
        if (!item) {
            item = {
                title: stripConventionalPrefix(pullRequest.title),
                rawTitle: pullRequest.title,
                author: pullRequest.author,
                pr: pullRequest.number,
                url: pullRequest.url,
            };
            itemsByPrNumber.set(pullRequest.number, item);
            items.push(item);
        }
    }
    return foundPullRequest ? items : [];
}
