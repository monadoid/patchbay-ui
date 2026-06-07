<script lang="ts">
  import { parseComponentProps, type ControlAppearance } from "@patchbayhq/ui";

  export let label = "Toggle";
  export let checked = false;
  export let appearance: ControlAppearance = "default";
  export let disabled = false;
  export let onCheckedChange: ((checked: boolean) => void) | undefined = undefined;

  let className = "";
  export { className as class };

  $: props = parseComponentProps("toggle", {
    appearance,
    checked,
    disabled,
    label,
  });

  function handleChange(event: Event) {
    checked = (event.currentTarget as HTMLInputElement).checked;
    onCheckedChange?.(checked);
  }
</script>

<label
  class={["toggle", className].filter(Boolean).join(" ")}
  data-appearance={props.appearance}
>
  <input aria-label={props.label} type="checkbox" bind:checked {disabled} on:change={handleChange} />
  <span aria-hidden="true"></span>
</label>
