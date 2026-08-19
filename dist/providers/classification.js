import { SECTION_CHORE, SECTION_ORDER } from '../constants/changelog.js';
import { isRecord, isString } from '../utils/is.js';
/**
 * Build the shared classification prompt for provider-specific request code.
 * @param titles PR or release-note titles to classify.
 * @returns Prompt payload containing titles and canonical categories.
 */
export function buildClassificationPrompt(titles) {
    return { titles, categories: SECTION_ORDER };
}
/**
 * Return the deterministic category fallback used when classification is unavailable.
 * @param titles Titles that could not be classified by a provider.
 * @returns Category map with all titles grouped under Chore.
 */
export function fallbackCategoryMap(titles) {
    return { [SECTION_CHORE]: titles };
}
/**
 * Parse a JSON string into a CategoryMap when the shape matches expectations.
 * @param rawJson Serialized JSON string returned by the LLM.
 * @returns CategoryMap when valid, otherwise undefined.
 */
export function parseCategoryMap(rawJson) {
    try {
        const parsed = JSON.parse(rawJson);
        if (!isRecord(parsed)) {
            return undefined;
        }
        const result = {};
        for (const [category, titles] of Object.entries(parsed)) {
            if (Array.isArray(titles) && titles.every(isString)) {
                result[category] = titles.slice();
            }
        }
        if (Object.keys(result).length === 0) {
            return undefined;
        }
        return result;
    }
    catch {
        return undefined;
    }
}
