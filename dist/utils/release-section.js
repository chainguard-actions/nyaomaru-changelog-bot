import { SECTION_ORDER } from '../constants/changelog.js';
import { CHANGELOG_ADDITIONAL_SECTION_HEADING_LEVEL, demoteAdditionalSectionHeadings, } from '../utils/release-markdown.js';
import { buildTitleLookup, findTitleMatch, } from '../utils/title-lookup.js';
const RELEASE_TITLE_MATCH_MIN_RELATIVE_PREFIX_LENGTH = 0.5;
function buildReleaseItemLookup(items) {
    return buildTitleLookup(items.map((item) => ({
        // WHY: LLM output can refer to either the stripped or raw title.
        titles: new Set([item.title, item.rawTitle].filter((title) => Boolean(title))),
        value: item,
    })));
}
function releaseItemKey(item) {
    return item.pr
        ? `pr-${item.pr}`
        : `title-${item.title}-${item.rawTitle ?? ''}`;
}
function formatReleaseItemBullet(item) {
    let line = `- ${item.title}`;
    if (item.author)
        line += ` by @${item.author}`;
    if (item.pr && item.url)
        line += ` in [#${item.pr}](${item.url})`;
    return line;
}
function collectCategorizedReleaseItems(section, categories, itemLookup, seenItemKeys) {
    const entries = [];
    for (const candidateTitle of categories[section] || []) {
        const item = findTitleMatch(candidateTitle, itemLookup, {
            minRelativePrefixLength: RELEASE_TITLE_MATCH_MIN_RELATIVE_PREFIX_LENGTH,
        });
        if (!item)
            continue;
        const itemKey = releaseItemKey(item);
        if (seenItemKeys.has(itemKey))
            continue;
        entries.push(item);
        seenItemKeys.add(itemKey);
    }
    return entries;
}
function appendCategorizedReleaseSections(lines, items, categories) {
    const itemLookup = buildReleaseItemLookup(items);
    const seenItemKeys = new Set();
    for (const section of SECTION_ORDER) {
        const entries = collectCategorizedReleaseItems(section, categories, itemLookup, seenItemKeys);
        if (!entries.length)
            continue;
        lines.push(`### ${section}`, '');
        for (const item of entries)
            lines.push(formatReleaseItemBullet(item));
        lines.push('');
    }
}
function appendAdditionalReleaseSections(lines, sections) {
    for (const section of sections) {
        lines.push(`${'#'.repeat(CHANGELOG_ADDITIONAL_SECTION_HEADING_LEVEL)} ${section.heading}`, '', demoteAdditionalSectionHeadings(section.body.trim()), '');
    }
}
/**
 * Build a categorized changelog section from parsed release data.
 * @param params Version, date, items, category mapping, and optional additions.
 * @returns Markdown section string.
 */
export function buildSectionFromRelease(params) {
    const { version, date, items, categories, sections = [] } = params;
    const lines = [`## [v${version}] - ${date}`, ''];
    appendCategorizedReleaseSections(lines, items, categories);
    appendAdditionalReleaseSections(lines, sections);
    if (params.fullChangelog) {
        lines.push(`**Full Changelog**: ${params.fullChangelog}`, '');
    }
    return lines.join('\n');
}
