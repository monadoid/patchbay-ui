<script lang="ts">
  import { parseComponentProps, type ArrowDirection } from "@patchbay/ui";

  export let value: ArrowDirection = "right";
  export let disabled = false;
  export let onValueChange: ((value: ArrowDirection) => void) | undefined = undefined;

  let className = "";
  export { className as class };

  $: props = parseComponentProps("arrows", { disabled, value });

  function select(nextValue: ArrowDirection) {
    value = nextValue;
    onValueChange?.(value);
  }
</script>

<div class={["arrows", className].filter(Boolean).join(" ")} role="group">
  <button aria-label="Left" aria-pressed={props.value === "left"} disabled={props.disabled} type="button" on:click={() => select("left")}></button>
  <button aria-label="Right" aria-pressed={props.value === "right"} disabled={props.disabled} type="button" on:click={() => select("right")}></button>
</div>
