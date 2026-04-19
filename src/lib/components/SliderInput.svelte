<script lang="ts">
	let { text, maxValue } = $props();
</script>

<div class="slider-input-container">
	<p>{text}</p>
	<input class="slider-input" type="range" />
	<p>{maxValue}</p>
</div>

<style lang="scss">
	.slider-input-container {
		display: flex;
		flex-direction: row;
		gap: 20px;
		align-items: center;
		justify-items: center;
		// background-color: red;
	}

	.slider-input {
		width: 100%;
		background-color: pink;
	}
</style>
