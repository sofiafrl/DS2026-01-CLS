<script lang="ts">
	import type { InputState } from '$lib/types/input-state';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import FileInput from '$lib/components/FileInput.svelte';
	import Spacer from '$lib/components/Spacer.svelte';
	import TextInput from '$lib/components/TextInput.svelte';

	let {
		input = $bindable(),
		onFileInput,
		onSelectText,
		onSelectFile,
		onSave,
		canSave
	}: {
		input: InputState;
		onFileInput: (file: File) => void | Promise<void>;
		onSelectText: () => void;
		onSelectFile: () => void;
		onSave: () => void;
		canSave: boolean;
	} = $props();
</script>

<Card title="Entrada">
	{#if input.inputType === 'text'}
		<TextInput bind:value={input.value} placeholder="Insira seu texto aqui" />
	{:else}
		<FileInput onInput={onFileInput} />
	{/if}

	<Spacer />

	<div class="actions">
		<Button text="Texto" onClick={onSelectText} />
		<Button text="Arquivo" onClick={onSelectFile} />
		<div class="save-action">
			<Button text="Salvar" onClick={onSave} disabled={!canSave} />
		</div>
	</div>
</Card>

<style lang="scss">
	.actions {
		display: flex;
		flex-direction: row;
		gap: 5px;
	}

	.save-action {
		margin-left: auto;
	}
</style>
