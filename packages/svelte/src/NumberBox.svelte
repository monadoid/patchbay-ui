<script lang="ts">
  import { parseComponentProps, type NumberFormat } from "@patchbay/ui";

  export let label = "Number";
  export let value = 0;
  export let min = 0;
  export let max = 127;
  export let step = 1;
  export let format: NumberFormat = "integer";
  export let disabled = false;
  export let onValueChange: ((value: number) => void) | undefined = undefined;

  let className = "";
  export { className as class };

  $: props = parseComponentProps("number-box", { disabled, format, label, max, min, step, value });

  function handleInput(event: Event) {
    value = Number((event.currentTarget as HTMLInputElement).value);
    onValueChange?.(value);
  }
</script>

<input
  aria-label={props.label}
  class={["number-box", className].filter(Boolean).join(" ")}
  disabled={props.disabled}
  max={props.max}
  min={props.min}
  step={props.step}
  type="number"
  bind:value
  on:input={handleInput}
/>
