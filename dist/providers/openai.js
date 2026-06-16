import { outputSchema } from '../utils/output-json-schema.js';
import { extractJsonObject } from '../utils/json-extract.js';
import { postJson } from '../utils/http.js';
import { OPENAI_CHAT_API, OPENAI_RESPONSES_API } from '../constants/openai.js';
import { LLM_CLASSIFY_MAX_TOKENS, LLM_GENERATE_MAX_TOKENS, LLM_TEMPERATURE_DEFAULT, LLM_REASONING_EFFORT, } from '../constants/prompt.js';
import { isReasoningModel, isRecord, isString } from '../utils/is.js';
import { PROVIDER_OPENAI } from '../constants/provider.js';
import { RELEASE_NOTES_SYSTEM_PROMPT } from '../constants/system-prompts.js';
import { buildClassificationPrompt, fallbackCategoryMap, parseCategoryMap, } from '../providers/classification.js';
const SYSTEM_OPENAI_CLASSIFY = 'Classify each pull request title into one of the given categories. Return a JSON object with those categories as keys and arrays of titles as values.';
/**
 * Extract the assistant message content from an OpenAI Chat Completions response.
 * @param json Raw JSON response.
 * @returns First choice message content or a fallback `'{}'` string.
 */
function extractOpenAiClassificationResponse(json) {
    if (isRecord(json) &&
        Array.isArray(json.choices) &&
        isRecord(json.choices[0]) &&
        isRecord(json.choices[0].message) &&
        isString(json.choices[0].message.content)) {
        return json.choices[0].message.content;
    }
    return '{}';
}
export class OpenAIProvider {
    name = PROVIDER_OPENAI;
    modelName;
    supports;
    apiKey;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.modelName = config.model;
        this.supports = {
            jsonMode: true,
            streaming: false,
            reasoning: isReasoningModel(this.modelName),
            maxOutputTokens: LLM_GENERATE_MAX_TOKENS,
        };
    }
    async generate(input) {
        const base = {
            model: this.modelName,
            input: [
                { role: 'system', content: RELEASE_NOTES_SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: JSON.stringify({
                        ...input,
                        requiredJsonSchema: outputSchema,
                    }),
                },
            ],
            max_output_tokens: LLM_GENERATE_MAX_TOKENS,
        };
        if (!isReasoningModel(this.modelName)) {
            base.temperature = LLM_TEMPERATURE_DEFAULT;
        }
        else {
            base.reasoning = { effort: LLM_REASONING_EFFORT };
        }
        const resp = await postJson(OPENAI_RESPONSES_API, base, { Authorization: `Bearer ${this.apiKey ?? ''}` }, 'OpenAI error');
        const outputText = resp.output_text || resp.output?.[0]?.content?.[0]?.text || '';
        return extractJsonObject(outputText);
    }
    async classifyTitles(titles, options = {}) {
        if (!titles.length)
            return {};
        if (!this.apiKey)
            return fallbackCategoryMap(titles);
        const prompt = buildClassificationPrompt(titles);
        const payload = {
            model: this.modelName,
            max_tokens: LLM_CLASSIFY_MAX_TOKENS,
            temperature: 0,
            messages: [
                { role: 'system', content: SYSTEM_OPENAI_CLASSIFY },
                { role: 'user', content: JSON.stringify(prompt) },
            ],
            // Enforce strict JSON object output for robust parsing.
            response_format: { type: 'json_object' },
        };
        try {
            const json = await postJson(OPENAI_CHAT_API, payload, { Authorization: `Bearer ${this.apiKey}` }, 'OpenAI classify error');
            const text = extractOpenAiClassificationResponse(json);
            const categories = parseCategoryMap(text);
            if (!categories) {
                throw new Error('OpenAI classify output did not match schema');
            }
            return categories;
        }
        catch (err) {
            if (options.throwOnError)
                throw err;
            return fallbackCategoryMap(titles);
        }
    }
}
