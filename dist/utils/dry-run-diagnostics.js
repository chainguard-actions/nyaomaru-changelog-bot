/**
 * Format provider diagnostics for dry-run output.
 * @param input Provider, model, and fallback state for the current run.
 * @returns Human-readable diagnostic block.
 */
export function formatDryRunDiagnostics(input) {
    const fallbackReasonText = input.fallbackReasons.length
        ? input.fallbackReasons.join('; ')
        : 'none';
    const lines = [
        `Provider: ${input.providerName}`,
        `Model: ${input.modelName}`,
        `AI used: ${input.aiUsed ? 'true' : 'false'}`,
        `Fallback reasons: ${fallbackReasonText}`,
    ];
    if (input.promptCustomization) {
        const customization = input.promptCustomization;
        const sourceText = customization.sources.length
            ? customization.sources.join('+')
            : 'none';
        const fileText = customization.fileStatus === 'not_provided'
            ? 'not_provided'
            : `${customization.fileStatus} (${customization.filePath ?? 'unknown'})`;
        const truncatedText = customization.truncated ? ', truncated=true' : '';
        lines.push(`Prompt customization: requested=${customization.requested}, applied=${customization.applied}, sources=${sourceText}, chars=${customization.chars}/${customization.maxChars}, encoding=${customization.encoding}${truncatedText}`, `Prompt customization file: ${fileText}`, `Prompt customization reason: ${customization.reason}`);
        if (customization.fileError) {
            lines.push(`Prompt customization file error: ${customization.fileError}`);
        }
    }
    if (input.why?.enabled) {
        const whyFallbackReasonText = input.why.fallbackReasons.length
            ? input.why.fallbackReasons.join('; ')
            : 'none';
        lines.push(`WHY targets: ${input.why.targetsFound}`, `WHY PR bodies fetched: ${input.why.prBodiesFetched}`, `WHY skipped before fetch: ${input.why.skippedBeforeFetch}`, `WHY skipped low trust: ${input.why.skippedLowTrust}`, `WHY notes rendered: ${input.why.notesRendered}`, `WHY fallback reasons: ${whyFallbackReasonText}`);
    }
    return lines.join('\n');
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
        ...(input.promptCustomization
            ? { promptCustomization: input.promptCustomization }
            : {}),
        ...(input.why?.enabled ? { why: input.why } : {}),
    };
    return JSON.stringify(report, null, 2);
}
