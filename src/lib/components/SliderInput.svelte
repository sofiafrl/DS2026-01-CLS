<script lang="ts">
	let { text, value = $bindable(), maxValue } = $props();
</script>

<div class="slider-input-container">
	<p>{text}</p>
	<div class="slider-container">
		<div style="flex:9;">
			<input class="slider-input" type="range" min="0" max={maxValue} bind:value />
		</div>
		<div style="flex: 1;">
			<p>
				{value}
			</p>
		</div>
	</div>
</div>

<style lang="scss">
	.slider-input-container {
		display: flex;
		flex-direction: column;
		// gap: 10px;
	}

	.slider-container {
		display: flex;
		flex-direction: row;
		gap: 20px;
		align-items: center;
		// justify-items: center;
		// background-color: red;
	}

	.slider-input {
		width: 100%;
		// background-color: pink;
	}
</style>
