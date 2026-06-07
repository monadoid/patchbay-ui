<script lang="ts">
  import { parseComponentProps, type DialMode } from "@patchbay/ui";
  import { ratio } from "./shared";

  export let label = "Dial";
  export let value = 0;
  export let min = 0;
  export let max = 1;
  export let step: number | "any" = 0.01;
  export let mode: DialMode = "unipolar";
  export let disabled = false;
  export let onValueChange: ((value: number) => void) | undefined = undefined;

  let className = "";
  export { className as class };

  $: props = parseComponentProps("dial", { disabled, label, max, min, mode, step, value });
  $: valueRatio = ratio(props.value, props.min, props.max);

  function handleInput(event: Event) {
    value = Number((event.currentTarget as HTMLInputElement).value);
    onValueChange?.(value);
  }
</script>

<label class={["field", className].filter(Boolean).join(" ")}>
  <span class="field__label">{props.label}</span>
  <span class="dial" data-dial style={`--dial-value: ${valueRatio}`}>
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
