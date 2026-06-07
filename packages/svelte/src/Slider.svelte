<script lang="ts">
  import { parseComponentProps, type Orientation } from "@patchbay/ui";
  import { init } from "./shared";

  export let label = "Slider";
  export let value = 0;
  export let min = 0;
  export let max = 1;
  export let step: number | "any" = 0.01;
  export let orientation: Orientation = "vertical";
  export let modulation: number | undefined = undefined;
  export let disabled = false;
  export let onValueChange: ((value: number) => void) | undefined = undefined;

  let className = "";
  export { className as class };

  $: props = parseComponentProps("slider", {
    disabled,
    label,
    max,
    min,
    modulation,
    orientation,
    step,
    value,
  });

  function handleInput(event: Event) {
    value = Number((event.currentTarget as HTMLInputElement).value);
    onValueChange?.(value);
  }
</script>

<label class={["field", className].filter(Boolean).join(" ")}>
  <span class="field__label">{props.label}</span>
  <span
    class="slider"
    data-slider
    data-orientation={props.orientation}
    data-modulation={props.modulation}
    use:init={[props.value, props.modulation, props.orientation]}
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
