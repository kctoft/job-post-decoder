import type Anthropic from '@anthropic-ai/sdk';

export async function streamAgentCall(
	client: Anthropic,
	prompt: string,
	model: string,
	onChunk: (text: string) => void,
	maxTokens = 2000
): Promise<string> {
	const stream = client.messages.stream({
		model,
		max_tokens: maxTokens,
		messages: [{ role: 'user', content: prompt }]
	});
	stream.on('text', (delta) => onChunk(delta));
	return await stream.finalText();
}
