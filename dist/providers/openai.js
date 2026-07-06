import { outputSchema } from '../utils/output-json-schema.js';
import { extractJsonObject } from '../utils/json-extract.js';
import { postJson } from '../utils/http.js';
import { OPENAI_CHAT_API, OPENAI_RESPONSES_API } from '../constants/openai.js';
import { LLM_CLASSIFY_MAX_TOKENS, LLM_GENERATE_MAX_TOKENS, LLM_WHY_MAX_TOKENS, LLM_TEMPERATURE_DEFAULT, LLM_REASONING_EFFORT, } from '../constants/prompt.js';
import { isReasoningModel, isRecord, isString } from '../utils/is.js';
import { PROVIDER_OPENAI } from '../constants/provider.js';
import { RELEASE_NOTES_SYSTEM_PROMPT } from '../constants/system-prompts.js';
import { buildClassificationPrompt, fallbackCategoryMap, parseCategoryMap, } from '../providers/classification.js';
import { buildWhyExtractionPrompt, parseWhyExtractionOutput, WHY_EXTRACTION_SYSTEM_PROMPT, } from '../providers/why.js';
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
/**
 * Extract generated text from an OpenAI Responses API payload.
 * @param response Responses API payload.
 * @returns Aggregated output text or an empty string.
 */
function extractOpenAiResponseText(response) {
    return response.output_text || response.output?.[0]?.content?.[0]?.text || '';
}
/**
 * Build a Responses API payload with parameters compatible with the model.
 * @param modelName OpenAI model identifier.
 * @param systemPrompt System instruction for the request.
 * @param userPrompt Serialized user prompt.
 * @param maxOutputTokens Maximum output token budget.
 * @returns Responses API request payload.
 */
function buildOpenAiResponsePayload(modelName, systemPrompt, userPrompt, maxOutputTokens) {
    const payload = {
        model: modelName,
        input: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        max_output_tokens: maxOutputTokens,
    };
    if (isReasoningModel(modelName)) {
        payload.reasoning = { effort: LLM_REASONING_EFFORT };
    }
    else {
        payload.temperature = LLM_TEMPERATURE_DEFAULT;
    }
    return payload;
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
        const payload = buildOpenAiResponsePayload(this.modelName, RELEASE_NOTES_SYSTEM_PROMPT, JSON.stringify({
            ...input,
            requiredJsonSchema: outputSchema,
        }), LLM_GENERATE_MAX_TOKENS);
        const resp = await postJson(OPENAI_RESPONSES_API, payload, { Authorization: `Bearer ${this.apiKey ?? ''}` }, 'OpenAI error');
        return extractJsonObject(extractOpenAiResponseText(resp));
    }
    async classifyTitles(titles, options = {}) {
        if (!titles.length)
            return {};
        if (!this.apiKey)
            return fallbackCategoryMap(titles);
        const prompt = buildClassificationPrompt(titles);
        try {
            let text;
            if (isReasoningModel(this.modelName)) {
                const payload = buildOpenAiResponsePayload(this.modelName, SYSTEM_OPENAI_CLASSIFY, JSON.stringify(prompt), LLM_CLASSIFY_MAX_TOKENS);
                const response = await postJson(OPENAI_RESPONSES_API, payload, { Authorization: `Bearer ${this.apiKey}` }, 'OpenAI classify error');
                text = extractOpenAiResponseText(response);
            }
            else {
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
                const response = await postJson(OPENAI_CHAT_API, payload, { Authorization: `Bearer ${this.apiKey}` }, 'OpenAI classify error');
                text = extractOpenAiClassificationResponse(response);
            }
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
    async extractWhyNotes(input) {
        if (!input.items.length)
            return { items: [] };
        const userPrompt = JSON.stringify(buildWhyExtractionPrompt(input));
        if (isReasoningModel(this.modelName)) {
            const payload = buildOpenAiResponsePayload(this.modelName, WHY_EXTRACTION_SYSTEM_PROMPT, userPrompt, LLM_WHY_MAX_TOKENS);
            const response = await postJson(OPENAI_RESPONSES_API, payload, { Authorization: `Bearer ${this.apiKey ?? ''}` }, 'OpenAI WHY extraction error');
            return parseWhyExtractionOutput(extractOpenAiResponseText(response));
        }
        const payload = {
            model: this.modelName,
            max_tokens: LLM_WHY_MAX_TOKENS,
            temperature: 0,
            messages: [
                { role: 'system', content: WHY_EXTRACTION_SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
            response_format: { type: 'json_object' },
        };
        const json = await postJson(OPENAI_CHAT_API, payload, { Authorization: `Bearer ${this.apiKey ?? ''}` }, 'OpenAI WHY extraction error');
        return parseWhyExtractionOutput(extractOpenAiClassificationResponse(json));
    }
}
