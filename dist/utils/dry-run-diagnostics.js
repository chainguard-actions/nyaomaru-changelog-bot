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
/**
 * Format provider diagnostics as stable JSON for dry-run automation.
 * @param input Provider, model, and fallback state for the current run.
 * @returns Pretty-printed JSON report.
 */
export function formatDryRunJsonReport(input) {
    const report = {
        provider: input.providerName,
        model: input.modelName,
        aiUsed: input.aiUsed,
        fallbackReasons: input.fallbackReasons,
    };
    return JSON.stringify(report, null, 2);
}
