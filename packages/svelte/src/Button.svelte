<script lang="ts">
  import {
    parseComponentProps,
    type ButtonMode,
    type ControlAppearance,
  } from "@patchbayhq/ui";

  export let label = "Button";
  export let pressed = false;
  export let mode: ButtonMode = "momentary";
  export let appearance: ControlAppearance = "default";
  export let disabled = false;
  export let onPressedChange: ((pressed: boolean) => void) | undefined = undefined;

  let className = "";
  export { className as class };

  $: props = parseComponentProps("button", {
    appearance,
    disabled,
    label,
    mode,
    pressed,
  });

  function setPressed(nextPressed: boolean) {
    if (props.disabled) return;
    pressed = nextPressed;
    onPressedChange?.(pressed);
  }
</script>

<button
  aria-label={props.label}
  aria-pressed={props.pressed}
  class={["button", props.pressed ? "is-active" : "", className].filter(Boolean).join(" ")}
  data-appearance={props.appearance}
  {disabled}
  type="button"
  on:click={() => {
    if (props.mode === "toggle") setPressed(!props.pressed);
  }}
  on:pointerdown={() => {
    if (props.mode === "momentary") setPressed(true);
  }}
  on:pointerleave={() => {
    if (props.mode === "momentary") setPressed(false);
  }}
  on:pointerup={() => {
    if (props.mode === "momentary") setPressed(false);
  }}
></button>
