import { readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
const CUSTOM_INSTRUCTIONS_ENCODING = 'utf8';
function normalizeInstructionText(text) {
    const trimmedText = text?.trim();
    return trimmedText ? trimmedText : undefined;
}
function readInstructionsFile(repoPath, instructionsFile) {
    const resolvedPath = isAbsolute(instructionsFile)
        ? instructionsFile
        : join(repoPath, instructionsFile);
    return readFileSync(resolvedPath, CUSTOM_INSTRUCTIONS_ENCODING);
}
/**
 * Resolve inline and file-based customization instructions into one prompt block.
 * @param input Inline instructions, optional file path, and repository path.
 * @returns Combined instructions, or undefined when none were provided.
 */
export function resolveCustomInstructions(input) {
    const instructionParts = [
        normalizeInstructionText(input.instructions),
        input.instructionsFile
            ? normalizeInstructionText(readInstructionsFile(input.repoPath, input.instructionsFile))
            : undefined,
    ].filter((instructionPart) => Boolean(instructionPart));
    return instructionParts.length ? instructionParts.join('\n\n') : undefined;
}
