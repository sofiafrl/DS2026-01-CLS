<script lang="ts">
	let {
		text = 'Selecionar arquivo',
		onInput,
		accept = '*'
	}: { text?: string; onInput: (file: File) => {}; accept?: string } = $props();

	let file = $state<File | null>(null);

	function handleChange(event: Event) {
		const eventTarget = event.currentTarget as HTMLInputElement;
		file = eventTarget.files?.[0] ?? null;

		if (file) {
			onInput(file);
		}
	}
</script>

<label class="file-input">
	<input type="file" {accept} onchange={handleChange} />
	<div class="button">{text}</div>
</label>

<style lang="scss">
	.file-input {
		align-items: center;
		gap: 10px;
		cursor: pointer;
	}

	input {
		position: absolute;
		width: 0px;
		height: 0px;
		opacity: 0;
	}

	.button {
		background-color: var(--background-color);
		border-radius: var(--border-radius);
		padding: 10px 20px;
		font-weight: 600;
	}
</style>
