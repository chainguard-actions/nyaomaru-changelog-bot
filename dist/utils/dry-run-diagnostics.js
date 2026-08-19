/**
 * Format provider diagnostics for dry-run output.
 * @param input Provider, model, and fallback state for the current run.
 * @returns Human-readable diagnostic block.
 */
export function formatDryRunDiagnostics(input) {
    const fallbackReasonText = input.fallbackReasons.length
        ? input.fallbackReasons.join('; ')
        : 'none';
    return [
        `Provider: ${input.providerName}`,
        `Model: ${input.modelName}`,
        `AI used: ${input.aiUsed ? 'true' : 'false'}`,
        `Fallback reasons: ${fallbackReasonText}`,
    ].join('\n');
}
