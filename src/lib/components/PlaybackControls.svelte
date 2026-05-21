<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';

	let {
		paused = $bindable(),
		onToggle
	}: {
		paused: boolean;
		onToggle: () => void;
	} = $props();
</script>

<div class="bottom-controls-container">
	<Card>
		<div class="control-buttons-container">
			<Button text={paused ? 'Tocar' : 'Pausar'} onClick={onToggle} />
		</div>
	</Card>
</div>

<style lang="scss">
	.bottom-controls-container {
		display: flex;
		position: fixed;
		bottom: 0;
		left: 0;
		padding-top: 30px;
		padding-bottom: 30px;
		justify-content: center;
		width: 100%;
	}

	.control-buttons-container {
		width: calc(var(--max-width) - (var(--padding) * 5));
		display: flex;
		flex-direction: row;
		gap: 20px;
		justify-content: center;
	}
</style>
