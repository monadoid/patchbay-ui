<script lang="ts">
  import {
    defineElements,
    parseComponentProps,
    type GridCell,
    type GridChangeDetail,
    type GridDirection,
    type StepColor,
  } from "@patchbay/ui";
  import { onMount } from "svelte";

  export let cells: GridCell[] = Array.from({ length: 16 }, () => ({
    active: false,
    color: "blue" as StepColor,
    y: 0.5,
  }));
  export let directions: GridDirection[] = Array.from({ length: 16 }, () => "right" as GridDirection);
  export let measureSize = 4;
  export let onCellsChange: ((cells: GridCell[]) => void) | undefined = undefined;
  export let onDirectionsChange: ((directions: GridDirection[]) => void) | undefined = undefined;

  let className = "";
  let element: HTMLElement & {
    cells: GridCell[];
    directions: GridDirection[];
    measureSize: number;
  };
  export { className as class };

  $: props = parseComponentProps("grid", { cells, directions, measureSize });
  $: if (element) syncElement();

  function syncElement() {
    element.cells = props.cells;
    element.directions = props.directions;
    element.measureSize = props.measureSize;
  }

  function handleChange(event: Event) {
    const detail = (event as CustomEvent<GridChangeDetail>).detail;
    cells = detail.cells;
    directions = detail.directions;
    onCellsChange?.(cells);
    onDirectionsChange?.(directions);
  }

  onMount(() => {
    defineElements();
    syncElement();
    element.addEventListener("grid-change", handleChange);

    return () => element.removeEventListener("grid-change", handleChange);
  });
</script>

<sequencer-grid bind:this={element} class={className}></sequencer-grid>
