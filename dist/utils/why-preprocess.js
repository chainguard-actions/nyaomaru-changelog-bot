import { WHY_MAX_BODY_WITHOUT_TARGET_SECTION, WHY_MIN_MODEL_TRUST_SCORE, WHY_RAW_BODY_SCAN_LIMIT, } from '../constants/why.js';
import { WHY_SECTION_ALIASES, } from '../constants/why-section-aliases.js';
import { isDependencyUpdateTitle } from '../utils/dependency-update.js';
import { escapeRegExp } from '../utils/escape.js';
const TARGET_SECTION_LABEL_PATTERN = Array.from(WHY_SECTION_ALIASES.keys())
    .sort((left, right) => right.length - left.length)
    .map(escapeRegExp)
    .join('|');
const TARGET_SECTION_LABEL_ONLY_RE = new RegExp(`^\\s*(?:[-*]\\s+)?(?:\\*\\*|__)?(?<name>${TARGET_SECTION_LABEL_PATTERN})\\s*[?？]?(?:(?:\\*\\*|__)\\s*[:：]?|[:：]\\s*(?:\\*\\*|__)?)?\\s*$`, 'iu');
const TEMPLATE_LABEL_RE = /^\s*(?:[-*]\s+)?(?:\*\*|__)?[\p{L}\p{N}][\p{L}\p{N}\s?/._-]{0,48}(?:(?:\*\*|__)?\s*[:：]|[:：]\s*(?:\*\*|__)?)\s*$/u;
const TEMPLATE_FIELD_LABELS = new Set([
    'approach',
    'implementation',
    'notes',
    'solution',
    'test plan',
    'testing',
    'tests',
]);
const STRONG_CANONICAL_SECTION_NAMES = new Set([
    'why',
    'reason',
    'because',
    'motivation',
    'context',
    'background',
    'problem',
    'rationale',
]);
const CONTAINER_CANONICAL_SECTION_NAMES = new Set([
    'summary',
    'description',
]);
const RATIONALE_MARKER_RE = /\b(because|so that|in order to|reason|rationale|motivation|to avoid|to prevent|context|problem)\b/i;
const PROBLEM_MARKER_RE = /\b(fix|prevent|avoid|missing|broken|incorrect|regression|failure|bug|issue|risk|support|compatib|performance)\b/i;
const ISSUE_REF_RE = /(?:fix(?:e[sd])?|close[sd]?|resolve[sd]?)\s+#\d+|https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/issues\/\d+/i;
const NON_SIGNAL_RE = /\b(changelog|readme|typo|format|lint|refactor only)\b/i;
const BOT_AUTHOR_RE = /(?:\[bot\]|bot$|renovate|dependabot)/i;
const PLACEHOLDER_LINE_RE = /^(?:n\/a|na|none|no response|not applicable|todo|tbd|please describe\b.*|please explain\b.*|describe the\b.*|add context\b.*|enter details\b.*|_+|-+|\.+)$/i;
const TARGET_INLINE_LABEL_RE = new RegExp(`^\\s*(?:[-*]\\s+)?(?:\\*\\*|__)?(?<name>${TARGET_SECTION_LABEL_PATTERN})(?:\\*\\*|__)?\\s*[:：]\\s*(?<text>[^\\n]+)$`, 'iu');
function normalizeBody(body) {
    return body
        .replace(/\r\n?/g, '\n')
        .replace(/<!--[\s\S]*?-->/g, '\n')
        .replace(/<summary\b[^>]*>([\s\S]*?)<\/summary>/gim, '$1:\n')
        .replace(/<\/?(?:details|summary)\b[^>]*>/gim, '\n')
        .replace(/!\[[^\]]*]\([^)]*\)/g, '\n')
        .replace(/\[!\[[^\]]*]\([^)]*\)]\([^)]*\)/g, '\n')
        .replace(/^\s*[-*]\s+\[[ xX]]\s+.*$/gm, '\n')
        .replace(/^\s*<img\b[^>]*>\s*$/gim, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
function normalizeHeadingName(value) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[*_`~]/g, '')
        .replace(/[:：].*$/, '')
        .replace(/\p{P}+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}
function canonicalTargetSectionName(value) {
    return WHY_SECTION_ALIASES.get(normalizeHeadingName(value));
}
function isTemplateFieldLabel(line) {
    if (!TEMPLATE_LABEL_RE.test(line))
        return false;
    return TEMPLATE_FIELD_LABELS.has(normalizeHeadingName(line));
}
function isTargetLabelBlock(line) {
    const labelMatch = line.match(TARGET_SECTION_LABEL_ONLY_RE);
    return (canonicalTargetSectionName(labelMatch?.groups?.name ?? '') !== undefined);
}
function isInlineTargetLabel(line) {
    const match = line.match(TARGET_INLINE_LABEL_RE);
    return canonicalTargetSectionName(match?.groups?.name ?? '') !== undefined;
}
function extractInlineTargetLabel(line) {
    const match = line.match(TARGET_INLINE_LABEL_RE);
    const name = canonicalTargetSectionName(match?.groups?.name ?? '');
    const text = (match?.groups?.text ?? '').trim();
    if (!name || !hasUsableCandidateText(text))
        return undefined;
    return { name, text, source: 'inline-label' };
}
function extractInlineTargetLabels(body) {
    const sections = [];
    for (const line of body.split('\n')) {
        const section = extractInlineTargetLabel(line);
        if (section)
            sections.push(section);
    }
    return sections;
}
function extractTargetLabelBlocks(body) {
    const lines = body.split('\n');
    const sections = [];
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
        const line = lines[lineIndex] ?? '';
        const labelMatch = line.match(TARGET_SECTION_LABEL_ONLY_RE);
        const name = canonicalTargetSectionName(labelMatch?.groups?.name ?? '');
        if (!name)
            continue;
        const textLines = [];
        for (let contentIndex = lineIndex + 1; contentIndex < lines.length; contentIndex += 1) {
            const contentLine = lines[contentIndex] ?? '';
            if (/^\s*#{1,6}\s+/.test(contentLine))
                break;
            if (TARGET_SECTION_LABEL_ONLY_RE.test(contentLine)) {
                break;
            }
            if (isTemplateFieldLabel(contentLine))
                break;
            if (isInlineTargetLabel(contentLine))
                break;
            textLines.push(contentLine);
        }
        const text = textLines.join('\n').trim();
        if (hasUsableCandidateText(text)) {
            sections.push({ name, text, source: 'label-block' });
        }
    }
    return sections;
}
function extractTargetSections(body) {
    const headingMatches = Array.from(body.matchAll(/^(?<marker>#{1,6})\s+(?<title>.+?)\s*#*\s*$/gm));
    const sections = [];
    let hasTargetSection = false;
    for (const [matchIndex, match] of headingMatches.entries()) {
        const rawTitle = match.groups?.title ?? '';
        const name = canonicalTargetSectionName(rawTitle);
        if (!name) {
            continue;
        }
        hasTargetSection = true;
        const startIndex = (match.index ?? 0) + match[0].length;
        const endIndex = headingMatches[matchIndex + 1]?.index === undefined
            ? body.length
            : headingMatches[matchIndex + 1].index;
        const text = body.slice(startIndex, endIndex).trim();
        if (!text)
            continue;
        const nestedLabelSections = extractTargetLabelBlocks(text).filter((section) => hasUsableCandidateText(section.text));
        const nestedInlineSections = extractInlineTargetLabels(text);
        if ((nestedLabelSections.length > 0 || nestedInlineSections.length > 0) &&
            CONTAINER_CANONICAL_SECTION_NAMES.has(name)) {
            sections.push(...nestedLabelSections);
            sections.push(...nestedInlineSections);
            continue;
        }
        sections.push({ name, text, source: 'heading' });
        sections.push(...nestedLabelSections);
        sections.push(...nestedInlineSections);
    }
    if (sections.length > 0) {
        return { sections, hasTargetSection: true };
    }
    hasTargetSection =
        hasTargetSection ||
            body
                .split('\n')
                .some((line) => isTargetLabelBlock(line) || isInlineTargetLabel(line));
    sections.push(...extractTargetLabelBlocks(body));
    // WHY: Container fields such as Summary: can contain a later inline
    // Why: label; keep scanning so that strong explicit WHY evidence is not
    // hidden inside lower-trust container prose.
    sections.push(...extractInlineTargetLabels(body));
    if (sections.length > 0) {
        return { sections, hasTargetSection: true };
    }
    return { sections, hasTargetSection };
}
function cleanCandidateLine(line) {
    return line
        .replace(/^\s*>\s?/, '')
        .replace(/^[-*]\s+/, '')
        .replace(/^\[[ xX]]\s+/, '')
        .replace(/^`{1,3}|`{1,3}$/g, '')
        .replace(/^[_*~]+|[_*~]+$/g, '')
        .trim();
}
function isPlaceholderLine(line) {
    const normalizedLine = line
        .replace(/^[_*~]+|[_*~]+$/g, '')
        .replace(/[.!?。！？]+$/g, '')
        .trim();
    return PLACEHOLDER_LINE_RE.test(normalizedLine);
}
function hasUsableCandidateText(text) {
    for (const rawLine of text.split('\n')) {
        const line = cleanCandidateLine(rawLine);
        if (!line)
            continue;
        if (/^https?:\/\//i.test(line) || isPlaceholderLine(line))
            continue;
        if (line.replace(/\s+/g, ' ').trim().length >= 16)
            return true;
    }
    return false;
}
function toCandidateSnippets(sections, body, maxCharsPerPr, allowBodyFallback) {
    const sources = sections.length > 0
        ? sections.map((section) => ({
            text: section.text,
            stopAtTemplateLabel: true,
        }))
        : allowBodyFallback
            ? [{ text: body, stopAtTemplateLabel: false }]
            : [];
    const snippets = [];
    for (const source of sources) {
        const cleanedLines = [];
        for (const rawLine of source.text.split('\n')) {
            const line = cleanCandidateLine(rawLine);
            if (!line)
                continue;
            if (isTemplateFieldLabel(line)) {
                if (source.stopAtTemplateLabel)
                    break;
                continue;
            }
            if (/^https?:\/\//i.test(line) || isPlaceholderLine(line))
                continue;
            cleanedLines.push(line);
        }
        for (const line of cleanedLines) {
            const compactLine = line.replace(/\s+/g, ' ').trim();
            if (compactLine.length < 16)
                continue;
            snippets.push(compactLine.slice(0, 240));
            if (snippets.join('\n').length >= maxCharsPerPr) {
                return boundSnippets(snippets, maxCharsPerPr);
            }
        }
    }
    return boundSnippets(snippets, maxCharsPerPr);
}
function boundSnippets(snippets, maxCharsPerPr) {
    const bounded = [];
    let usedChars = 0;
    for (const snippet of snippets) {
        const availableChars = maxCharsPerPr - usedChars;
        if (availableChars <= 0)
            break;
        bounded.push(snippet.slice(0, availableChars));
        usedChars += snippet.length + 1;
    }
    return bounded;
}
function trustBucketForScore(score) {
    if (score >= 9)
        return 'high';
    if (score >= WHY_MIN_MODEL_TRUST_SCORE)
        return 'medium';
    if (score > 0)
        return 'low';
    return 'none';
}
function scoreCandidateMaterial(sections, candidates, body) {
    const candidateText = candidates.join('\n');
    let score = 0;
    if (sections.some((section) => STRONG_CANONICAL_SECTION_NAMES.has(section.name))) {
        score += 4;
    }
    else if (sections.length > 0) {
        score += 2;
    }
    if (sections.some((section) => section.source === 'label-block' &&
        STRONG_CANONICAL_SECTION_NAMES.has(section.name))) {
        score += 2;
    }
    const hasRationaleMarker = RATIONALE_MARKER_RE.test(candidateText);
    const hasProblemMarker = PROBLEM_MARKER_RE.test(candidateText);
    if (hasRationaleMarker)
        score += 3;
    if (hasProblemMarker)
        score += 2;
    if (ISSUE_REF_RE.test(body))
        score += 1;
    if (candidateText.length >= 60)
        score += 1;
    if (candidateText.length > 500)
        score += 1;
    if (containsNonAscii(candidateText) && candidateText.length >= 40) {
        score += 6;
    }
    if (NON_SIGNAL_RE.test(candidateText) &&
        !hasRationaleMarker &&
        !hasProblemMarker) {
        score -= 2;
    }
    return Math.max(score, 0);
}
function hasStrongStructuralSignal(sections) {
    return sections.some((section) => STRONG_CANONICAL_SECTION_NAMES.has(section.name));
}
function containsNonAscii(value) {
    return Array.from(value).some((character) => character.charCodeAt(0) > 127);
}
/**
 * Convert a PR body into bounded WHY candidate snippets with local trust.
 * @param target Changelog PR target.
 * @param details Pull request details fetched from GitHub.
 * @param options Preprocessing limits.
 * @returns Provider-ready item or a skip reason.
 */
export function preprocessWhyPrBody(target, details, options) {
    const title = details.title || target.itemText;
    if (isDependencyUpdateTitle(title) ||
        (details.author && BOT_AUTHOR_RE.test(details.author))) {
        return {
            skippedReason: `Skipped PR #${target.prNumber}: automatic maintenance PR`,
            lowTrust: false,
        };
    }
    const body = normalizeBody(details.body).slice(0, WHY_RAW_BODY_SCAN_LIMIT);
    if (!body) {
        return {
            skippedReason: `Skipped PR #${target.prNumber}: empty PR description`,
            lowTrust: true,
        };
    }
    const extracted = extractTargetSections(body);
    if (!extracted.hasTargetSection &&
        body.length > WHY_MAX_BODY_WITHOUT_TARGET_SECTION) {
        return {
            skippedReason: `Skipped PR #${target.prNumber}: PR description too large without target section`,
            lowTrust: true,
        };
    }
    const candidates = toCandidateSnippets(extracted.sections, body, options.maxCharsPerPr, !extracted.hasTargetSection);
    if (candidates.length === 0) {
        return {
            skippedReason: `Skipped PR #${target.prNumber}: no usable WHY candidate`,
            lowTrust: true,
        };
    }
    const trustScore = scoreCandidateMaterial(extracted.sections, candidates, body);
    const trustBucket = trustBucketForScore(trustScore);
    const requiresHighConfidence = containsNonAscii(candidates.join('\n')) &&
        !hasStrongStructuralSignal(extracted.sections);
    if (trustScore < WHY_MIN_MODEL_TRUST_SCORE) {
        return {
            skippedReason: `Skipped PR #${target.prNumber}: low local trust score (${trustScore})`,
            lowTrust: true,
        };
    }
    return {
        item: {
            prNumber: target.prNumber,
            itemText: target.itemText,
            sectionTitle: target.sectionTitle,
            title,
            candidates,
            trustScore,
            trustBucket,
            requiresHighConfidence,
        },
        lowTrust: false,
    };
}
