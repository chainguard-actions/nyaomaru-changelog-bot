import { fallbackCategoryMap } from '../providers/classification.js';
import { providerFactory } from '../utils/provider.js';
function providerFromConfig(providerName, config) {
    const providerConfigs = {
        openai: config,
        anthropic: config,
        gemini: config,
    };
    return providerFactory(providerName, providerConfigs);
}
/**
 * Classify PR titles into changelog categories using the selected LLM provider.
 * Falls back to classifying all as `Chore` when no API key is present or on failure.
 * WHY: Provider-specific request details live in provider adapters; this helper
 * remains as a stable compatibility wrapper for existing callers.
 * @param titles List of PR titles to classify.
 * @param provider Provider adapter or provider name.
 * @param config Runtime config required when passing a provider name.
 * @returns Map of category -> titles.
 */
export async function classifyTitles(titles, provider, config) {
    if (!titles.length)
        return {};
    if (typeof provider !== 'string') {
        return provider.classifyTitles(titles);
    }
    if (!config) {
        return fallbackCategoryMap(titles);
    }
    const providerAdapter = providerFromConfig(provider, config);
    return providerAdapter.classifyTitles(titles);
}
