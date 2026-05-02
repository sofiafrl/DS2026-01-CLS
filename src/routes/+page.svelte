<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import FileInput from '$lib/components/FileInput.svelte';
	import SliderInput from '$lib/components/SliderInput.svelte';
	import Spacer from '$lib/components/Spacer.svelte';
	import TextInput from '$lib/components/TextInput.svelte';

	let input: { inputType: 'text'; value: string } | { inputType: 'file' } = $state({
		inputType: 'text',
		value: ''
	});

	let bpm = $state(75);
	let volume = $state(50);
	let paused = $state(true);
</script>

<h3>Pepperfy&trade;</h3>

<Card title="Entrada">
	{#if input.inputType === 'text'}
		<TextInput bind:value={input.value} placeholder="Insira seu texto aqui" />
	{:else if input.inputType === 'file'}
		<FileInput
			onInput={async (file) => (input = { inputType: 'text', value: await file.text() })}
		/>
	{/if}

	<Spacer />

	<div style="display: flex; flex-direction: row; gap: 5px;">
		<Button text="Texto" onClick={() => (input = { inputType: 'text', value: '' })} />
		<Button text="Arquivo" onClick={() => (input = { inputType: 'file' })} />
		<div style="margin-left: auto;">
			<Button text="Salvar" onClick={() => (input = { inputType: 'file' })} />
		</div>
	</div>
</Card>

<Spacer />

<Card title="Configurações">
	<SliderInput text="BPM" bind:value={bpm} maxValue={150} />
	<SliderInput text="Volume" bind:value={volume} maxValue={100} />
</Card>

<Spacer />

<div class="bottom-controls-container">
	<Card>
		<div class="control-buttons-container">
			{#if paused}
				<Button text="Tocar" onClick={() => (paused = false)} />
			{:else}
				<Button text="Pausar" onClick={() => (paused = true)} />
			{/if}
		</div>
	</Card>
</div>

<style lang="scss">
	.bottom-controls-container {
		display: flex;
		position: fixed;
		bottom: 0;
		left: 0;
		height: auto;
		padding-top: 30px;
		padding-bottom: 30px;
		box-sizing: border-box;

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
