<script lang="ts">
  import { parseComponentProps, type LineOrientation } from "@patchbayhq/ui";

  export let orientation: LineOrientation = "horizontal";
  export let length = 170;
  export let thickness = 7;

  let className = "";
  export { className as class };

  $: props = parseComponentProps("line", { length, orientation, thickness });
  $: style =
    props.orientation === "vertical"
      ? `block-size: ${props.length}px; inline-size: ${props.thickness}px`
      : `block-size: ${props.thickness}px; inline-size: ${props.length}px`;
</script>

<span aria-hidden="true" class={["line", props.orientation === "vertical" ? "line--vertical" : "", className].filter(Boolean).join(" ")} {style}></span>
