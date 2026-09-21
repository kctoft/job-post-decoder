<script lang="ts">
	let {
		label,
		color = 'var(--accent-light)',
		bg = 'var(--accent-bg)'
	}: {
		label: string;
		color?: string;
		bg?: string;
	} = $props();
</script>

<span class="badge" style="background: {bg}; color: {color};">{label}</span>

<style>
	.badge {
		font-size: 12px;
		font-weight: 600;
		padding: 5px 12px;
		border-radius: 20px;
		display: inline-block;
	}
</style>
