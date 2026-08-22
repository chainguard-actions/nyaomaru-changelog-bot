import { z } from 'zod';
import { LLMOutputSchema } from '../schema/schema.js';
import { isInstanceOf } from '../utils/is.js';
const isZodArray = isInstanceOf(z.ZodArray);
const isZodDefault = isInstanceOf(z.ZodDefault);
const isZodOptional = isInstanceOf(z.ZodOptional);
const isZodString = isInstanceOf(z.ZodString);
/**
 * Recursively unwrap optional/default wrappers to reach the inner schema.
 * @param schema Zod schema to inspect.
 * @returns Inner non-optional schema.
 */
function unwrapOptional(schema) {
    if (isZodDefault(schema))
        return unwrapOptional(schema.unwrap());
    if (isZodOptional(schema))
        return unwrapOptional(schema.unwrap());
    return schema;
}
/**
 * Determine whether the schema is optional (directly or via default).
 * @param schema Zod schema to inspect.
 */
function isOptionalSchema(schema) {
    return isZodOptional(schema) || isZodDefault(schema);
}
/**
 * Build a permissive JSON Schema representation for Zod array schemas.
 * @param schema Array schema to convert.
 * @returns JSON Schema fragment describing the array.
 */
function buildJsonSchemaForArray(schema) {
    const inner = unwrapOptional(schema.element);
    if (isZodString(inner)) {
        return { type: 'array', items: { type: 'string' } };
    }
    return {}; // unknown array element type, stay permissive
}
/**
 * Convert a Zod property schema into a JSON Schema property definition.
 * @param schema Property schema to convert.
 * @returns JSON Schema fragment.
 */
function buildJsonSchemaForProperty(schema) {
    const core = unwrapOptional(schema);
    if (isZodString(core))
        return { type: 'string' };
    if (isZodArray(core))
        return buildJsonSchemaForArray(core);
    return {}; // default to loose typing when structure is unfamiliar
}
/**
 * Derive a minimal JSON Schema from the LLMOutput Zod schema for provider prompts.
 * WHY: Keep Zod as the single source of truth and generate the provider-facing schema.
 * Note: Handles string, array<string>, and optional/default unwrapping used in our schema.
 */
function toJsonSchemaFromZodObject(obj) {
    const shape = obj.shape;
    const properties = {};
    const required = [];
    for (const key of Object.keys(shape)) {
        const schema = shape[key];
        const optional = isOptionalSchema(schema);
        properties[key] = buildJsonSchemaForProperty(schema);
        if (!optional)
            required.push(key);
    }
    return {
        type: 'object',
        properties,
        required,
    };
}
/**
 * JSON Schema describing the expected LLM output structure, generated from Zod definitions.
 */
export const outputSchema = toJsonSchemaFromZodObject(LLMOutputSchema);
