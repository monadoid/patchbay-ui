<script lang="ts">
  import { onMount } from "svelte";
  import {
    initDials,
    parseComponentProps,
    type DialDragAxis,
    type DialMode,
  } from "@patchbayhq/ui";
  import { ratio } from "./shared";

  export let label = "Dial";
  export let value = 0;
  export let min = 0;
  export let max = 1;
  export let step: number | "any" = 0.01;
  export let mode: DialMode = "unipolar";
  export let dragAxis: DialDragAxis = "vertical";
  export let disabled = false;
  export let onValueChange: ((value: number) => void) | undefined = undefined;

  let className = "";
  let root: HTMLSpanElement | undefined;
  export { className as class };

  onMount(() => {
    if (root) initDials(root);
  });

  $: props = parseComponentProps("dial", {
    disabled,
    dragAxis,
    label,
    max,
    min,
    mode,
    step,
    value,
  });
  $: valueRatio = ratio(props.value, props.min, props.max);
  $: if (root) initDials(root);

  function handleInput(event: Event) {
    value = Number((event.currentTarget as HTMLInputElement).value);
    onValueChange?.(value);
  }
</script>

<label class={["field", className].filter(Boolean).join(" ")}>
  <span class="field__label">{props.label}</span>
  <span
    bind:this={root}
    class="dial"
    data-dial
    data-drag-axis={props.dragAxis}
    style={`--dial-value: ${valueRatio}`}
  >
    <input
      aria-label={props.label}
      type="range"
      min={props.min}
      max={props.max}
      step={props.step}
      bind:value
      {disabled}
      on:input={handleInput}
    />
  </span>
</label>
