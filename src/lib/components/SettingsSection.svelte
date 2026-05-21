<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import SliderInput from '$lib/components/SliderInput.svelte';

	let {
		bpm = $bindable(),
		volume = $bindable()
	}: {
		bpm: number;
		volume: number;
	} = $props();
</script>

<Card title="Configurações">
	<SliderInput text="BPM" bind:value={bpm} maxValue={150} />
	<SliderInput text="Volume" bind:value={volume} maxValue={100} />
</Card>
