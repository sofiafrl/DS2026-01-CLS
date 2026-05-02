<script lang="ts">
	let { value = $bindable(), placeholder }: { value: string; placeholder: string | null } =
		$props();
</script>

<textarea class="text-input" bind:value {placeholder}></textarea>

<style lang="scss">
	.text-input {
		background-color: var(--background-color);
		border: none;
		width: 100%;
		box-sizing: border-box;
		border-radius: var(--border-radius);
		padding: 10px;
		min-height: 100px;
		resize: vertical;
		font-family: inherit;
		max-height: 30vh;
		// font-size: inherit;
	}
</style>
