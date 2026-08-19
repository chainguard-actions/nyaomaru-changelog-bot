import { outputSchema } from '../utils/output-json-schema.js';
import { extractJsonObject } from '../utils/json-extract.js';
import { postJson } from '../utils/http.js';
import { ANTHROPIC_API, ANTHROPIC_VERSION } from '../constants/anthropic.js';
import { LLM_CLASSIFY_MAX_TOKENS, LLM_GENERATE_MAX_TOKENS, LLM_TEMPERATURE_DEFAULT, } from '../constants/prompt.js';
import { PROVIDER_ANTHROPIC } from '../constants/provider.js';
import { RELEASE_NOTES_SYSTEM_PROMPT } from '../constants/system-prompts.js';
import { buildClassificationPrompt, fallbackCategoryMap, parseCategoryMap, } from '../providers/classification.js';
import { isRecord, isString } from '../utils/is.js';
const SYSTEM_ANTHROPIC_CLASSIFY = 'You are a changelog section classifier. Return JSON mapping each category to an array of titles. Use only the provided categories.';
/**
 * Extract the assistant text content from an Anthropic Messages API response.
 * @param json Raw JSON response.
 * @returns First message text or an empty string.
 */
function extractAnthropicClassificationResponse(json) {
    // Prefer structured tool_use output when present.
    if (isRecord(json) && Array.isArray(json.content)) {
        const first = json.content[0];
        // tool_use content: { type: 'tool_use', name, input: {...} }
        if (isRecord(first) && first.type === 'tool_use' && isRecord(first.input)) {
            // Note: If first.input contains circular references, JSON.stringify will throw.
            // If this is a concern, handle or document it explicitly.
            return JSON.stringify(first.input);
        }
        // Fallback to plain text when model did not use tools/structured outputs.
        if (isRecord(first) && isString(first.text)) {
            return first.text;
        }
    }
    return '';
}
export class AnthropicProvider {
    name = PROVIDER_ANTHROPIC;
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
            model: this.modelName,
            max_tokens: LLM_GENERATE_MAX_TOKENS,
            temperature: LLM_TEMPERATURE_DEFAULT,
            system: RELEASE_NOTES_SYSTEM_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: JSON.stringify({
                        ...input,
                        requiredJsonSchema: outputSchema,
                    }),
                },
            ],
        };
        const json = await postJson(ANTHROPIC_API, payload, {
            'x-api-key': this.apiKey ?? '',
            'anthropic-version': ANTHROPIC_VERSION,
        }, 'Anthropic error');
        const outputText = json.content?.[0]?.text ?? '';
        return extractJsonObject(outputText);
    }
    async classifyTitles(titles) {
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
            model: this.modelName,
            max_tokens: LLM_CLASSIFY_MAX_TOKENS,
            temperature: 0,
            system: SYSTEM_ANTHROPIC_CLASSIFY,
            messages: [{ role: 'user', content: JSON.stringify(prompt) }],
            tools: [
                {
                    name: 'return_categories',
                    description: 'Return a JSON object mapping each category to an array of titles.',
                    input_schema: {
                        type: 'object',
                        properties,
                        additionalProperties: false,
                    },
                },
            ],
            tool_choice: { type: 'tool', name: 'return_categories' },
        };
        try {
            const json = await postJson(ANTHROPIC_API, payload, {
                'x-api-key': this.apiKey,
                'anthropic-version': ANTHROPIC_VERSION,
            }, 'Anthropic classify error');
            const text = extractAnthropicClassificationResponse(json) || '{}';
            return parseCategoryMap(text) ?? fallbackCategoryMap(titles);
        }
        catch {
            return fallbackCategoryMap(titles);
        }
    }
}
