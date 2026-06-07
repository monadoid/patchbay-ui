<script lang="ts">
  import {
    parseComponentProps,
    type ControlAppearance,
  } from "@patchbay/ui";

  export let value = false;
  export let labels = { off: "Off", on: "On" };
  export let icon: string | undefined = undefined;
  export let picture: string | undefined = undefined;
  export let pictureAlt = "";
  export let appearance: ControlAppearance = "default";
  export let disabled = false;
  export let onValueChange: ((value: boolean) => void) | undefined = undefined;

  let className = "";
  export { className as class };

  $: props = parseComponentProps("text-button", {
    appearance,
    disabled,
    icon,
    labels,
    picture,
    pictureAlt,
    value,
  });
  $: label = props.value ? props.labels.on : props.labels.off;

  function toggle() {
    value = !props.value;
    onValueChange?.(value);
  }
</script>

<button
  aria-pressed={props.value}
  class={["text-button", className].filter(Boolean).join(" ")}
  data-appearance={props.appearance}
  {disabled}
  type="button"
  on:click={toggle}
>
  {#if props.picture}
    <img
      alt={props.pictureAlt}
      class="text-button__picture"
      src={props.picture}
    />
  {:else if props.icon}
    <span aria-hidden="true" class="text-button__icon">{props.icon}</span>
  {/if}
  <span class="text-button__label"><slot>{label}</slot></span>
</button>
