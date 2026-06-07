<script lang="ts">
  import { parseComponentProps } from "@patchbay/ui";

  export let swatches = ["#9cd8ca", "#f0b51d", "#aebaff"];
  export let value: string | undefined = undefined;
  export let onValueChange: ((value: string) => void) | undefined = undefined;

  let className = "";
  export { className as class };

  $: props = parseComponentProps("color-swatches", { swatches, value });

  function select(nextValue: string) {
    value = nextValue;
    onValueChange?.(nextValue);
  }
</script>

<div class={["color-swatches", className].filter(Boolean).join(" ")} aria-label="Color swatches">
  {#each props.swatches as swatch, index (`${swatch}-${index}`)}
    <input aria-label={`Color ${index + 1}`} type="color" value={props.value === swatch ? props.value : swatch} on:input={(event) => select((event.currentTarget as HTMLInputElement).value)} />
  {/each}
</div>
