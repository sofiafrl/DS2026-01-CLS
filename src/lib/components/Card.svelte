<script lang="ts">
	import type { Snippet } from 'svelte';
	import Spacer from './Spacer.svelte';

	let { title, children }: { title?: string; children: Snippet } = $props();
</script>

<div class="card">
	{#if title}
		<h3 style="margin: 0;">{title}</h3>
		<Spacer />
	{/if}

	{@render children()}
</div>

<style lang="scss">
	.card {
		background-color: white;
		border-radius: var(--border-radius);
		border-color: #eaeaea;
		border-width: 2px;
		border-style: solid;

		padding: 15px;
	}
</style>
