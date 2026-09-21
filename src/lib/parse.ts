export function extractJson(text: string): unknown {
	const cleaned = text
		.trim()
		.replace(/^```json\s*/i, '')
		.replace(/^```\s*/i, '')
		.replace(/```$/i, '');
	return JSON.parse(cleaned);
}
