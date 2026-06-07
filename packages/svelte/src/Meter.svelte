<script lang="ts">
  import { parseComponentProps, type Orientation } from "@patchbayhq/ui";

  export let level = 0;
  export let peak: number | undefined = undefined;
  export let orientation: Orientation = "vertical";

  let className = "";
  export { className as class };

  $: props = parseComponentProps("meter", { level, orientation, peak });
</script>

<div
  aria-label="Signal meter"
  class={["meter", className].filter(Boolean).join(" ")}
  data-meter
  data-orientation={props.orientation}
>
  <span
    aria-hidden="true"
    class="meter__bar"
    data-meter-bar
    style={`--meter-value: ${props.level}; --meter-peak: ${props.peak}`}
  >
    <span aria-hidden="true" class="meter__peak"></span>
  </span>
</div>
