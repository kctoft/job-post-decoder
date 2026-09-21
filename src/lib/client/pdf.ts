export async function extractPdfText(file: File): Promise<string> {
	const pdfjsLib = await import('pdfjs-dist');
	pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
		'pdfjs-dist/build/pdf.worker.min.mjs',
		import.meta.url
	).href;

	const buffer = await file.arrayBuffer();
	const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
	let text = '';
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const content = await page.getTextContent();
		text += content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ') + '\n\n';
	}

	if (!text.trim()) throw new Error('Could not extract text — is this a scanned/image PDF?');
	return text.trim();
}
