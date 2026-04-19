<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import SliderInput from '$lib/components/SliderInput.svelte';
	import Spacer from '$lib/components/Spacer.svelte';
	import TextInput from '$lib/components/TextInput.svelte';

	let input: { inputType: 'text' | 'file'; value: string } = $state({
		inputType: 'text',
		value: ''
	});

	let inputPlaceholder = $derived(
		input.inputType === 'text' ? 'Insira seu texto aqui' : 'Selecione um arquivo'
	);
</script>

<h3>Peppertify&trade;</h3>
<h5>All rights reserved</h5>

<Card title="Entrada">
	<TextInput value={input.value} placeholder={inputPlaceholder} />

	<Spacer />

	<Button text="Texto" onClick={() => (input = { inputType: 'text', value: '' })} />
	<Button text="Arquivo" onClick={() => (input = { inputType: 'file', value: '' })} />
</Card>

<Spacer />

<Card title="Configurações">
	<SliderInput text="BPM" maxValue={150} />
	<SliderInput text="Volume" maxValue={100} />
</Card>

<Spacer />

<Card>
	<div class="control-buttons-container">
		<Button text="Tocar" onClick={() => {}} />
		<Button text="Parar" onClick={() => {}} />
	</div>
</Card>

<style lang="scss">
	.control-buttons-container {
		display: flex;
		flex-direction: row;
		gap: 20px;
		align-items: center;
		justify-content: center;
	}
</style>
