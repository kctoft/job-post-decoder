export function fitColor(score: number): string {
	if (score >= 70) return '#22c55e';
	if (score >= 40) return '#f59e0b';
	return '#ef4444';
}
