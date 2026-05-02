<script lang="ts">
	let { text, onClick } = $props();
</script>

<button class="button" onclick={onClick}>{text}</button>

<style lang="scss">
	.button {
		border: none;
		background-color: var(--background-color);
		border-radius: var(--border-radius);
		cursor: pointer;

		// padding: 10px;
		padding: 10px 20px 10px 20px;
	}
</style>
