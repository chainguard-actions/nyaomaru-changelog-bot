import { outputSchema } from '../utils/output-json-schema.js';
import { extractJsonObject } from '../utils/json-extract.js';
import { postJson } from '../utils/http.js';
import { GEMINI_API_BASE } from '../constants/gemini.js';
import { LLM_CLASSIFY_MAX_TOKENS, LLM_GENERATE_MAX_TOKENS, LLM_WHY_MAX_TOKENS, LLM_TEMPERATURE_DEFAULT, } from '../constants/prompt.js';
import { PROVIDER_GEMINI } from '../constants/provider.js';
import { RELEASE_NOTES_SYSTEM_PROMPT } from '../constants/system-prompts.js';
import { buildClassificationPrompt, fallbackCategoryMap, parseCategoryMap, } from '../providers/classification.js';
import { buildWhyExtractionPrompt, parseWhyExtractionOutput, WHY_EXTRACTION_SYSTEM_PROMPT, whyExtractionJsonSchema, } from '../providers/why.js';
const SYSTEM_GEMINI_CLASSIFY = 'Classify each pull request title into one of the given categories. Return a JSON object with those categories as keys and arrays of titles as values.';
/**
 * Build the Gemini generateContent endpoint URL for a model.
 * @param modelName Gemini model identifier.
 * @returns Full REST endpoint URL.
 */
function buildGeminiGenerateUrl(modelName) {
    return `${GEMINI_API_BASE}/models/${encodeURIComponent(modelName)}:generateContent`;
}
/**
 * Extract concatenated text from the first Gemini candidate.
 * @param response Gemini generateContent response.
 * @returns Candidate text or an empty string.
 */
function extractGeminiText(response) {
    return (response.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? '')
        .join('') ?? '');
}
/** Gemini provider adapter backed by the Google AI generateContent REST API. */
export class GeminiProvider {
    name = PROVIDER_GEMINI;
    modelName;
    supports;
    apiKey;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.modelName = config.model;
        this.supports = {
            jsonMode: true,
            streaming: false,
            reasoning: false,
            maxOutputTokens: LLM_GENERATE_MAX_TOKENS,
        };
    }
    async generate(input) {
        const payload = {
            systemInstruction: {
                parts: [{ text: RELEASE_NOTES_SYSTEM_PROMPT }],
            },
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: JSON.stringify({
                                ...input,
                                requiredJsonSchema: outputSchema,
                            }),
                        },
                    ],
                },
            ],
            generationConfig: {
                maxOutputTokens: LLM_GENERATE_MAX_TOKENS,
                temperature: LLM_TEMPERATURE_DEFAULT,
                responseMimeType: 'application/json',
                responseJsonSchema: outputSchema,
            },
        };
        const response = await postJson(buildGeminiGenerateUrl(this.modelName), payload, { 'x-goog-api-key': this.apiKey ?? '' }, 'Gemini error');
        return extractJsonObject(extractGeminiText(response));
    }
    async classifyTitles(titles, options = {}) {
        if (!titles.length)
            return {};
        if (!this.apiKey)
            return fallbackCategoryMap(titles);
        const prompt = buildClassificationPrompt(titles);
        const properties = {};
        for (const category of prompt.categories) {
            properties[category] = { type: 'array', items: { type: 'string' } };
        }
        const payload = {
            systemInstruction: {
                parts: [{ text: SYSTEM_GEMINI_CLASSIFY }],
            },
            contents: [
                {
                    role: 'user',
                    parts: [{ text: JSON.stringify(prompt) }],
                },
            ],
            generationConfig: {
                maxOutputTokens: LLM_CLASSIFY_MAX_TOKENS,
                temperature: 0,
                responseMimeType: 'application/json',
                responseJsonSchema: {
                    type: 'object',
                    properties,
                    required: [...prompt.categories],
                    additionalProperties: false,
                },
            },
        };
        try {
            const response = await postJson(buildGeminiGenerateUrl(this.modelName), payload, { 'x-goog-api-key': this.apiKey }, 'Gemini classify error');
            const categories = parseCategoryMap(extractGeminiText(response));
            if (!categories) {
                throw new Error('Gemini classify output did not match schema');
            }
            return categories;
        }
        catch (err) {
            if (options.throwOnError)
                throw err;
            return fallbackCategoryMap(titles);
        }
    }
    async extractWhyNotes(input) {
        if (!input.items.length)
            return { items: [] };
        const payload = {
            systemInstruction: {
                parts: [{ text: WHY_EXTRACTION_SYSTEM_PROMPT }],
            },
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: JSON.stringify(buildWhyExtractionPrompt(input)),
                        },
                    ],
                },
            ],
            generationConfig: {
                maxOutputTokens: LLM_WHY_MAX_TOKENS,
                temperature: 0,
                responseMimeType: 'application/json',
                responseJsonSchema: whyExtractionJsonSchema,
            },
        };
        const response = await postJson(buildGeminiGenerateUrl(this.modelName), payload, { 'x-goog-api-key': this.apiKey ?? '' }, 'Gemini WHY extraction error');
        return parseWhyExtractionOutput(extractGeminiText(response));
    }
}
