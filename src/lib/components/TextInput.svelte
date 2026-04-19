<script lang="ts">
	let { value, placeholder }: { value: string; placeholder: string | null } = $props();
</script>

<textarea class="text-input" {placeholder}>{value}</textarea>

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
		// font-size: inherit;
	}
</style>
