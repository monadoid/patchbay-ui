<script lang="ts">
  import {
    defineElements,
    parseComponentProps,
    type StepChangeDetail,
    type StepKey,
    type StepLoop,
    type StepNote,
  } from "@patchbayhq/ui";
  import { onMount } from "svelte";

  export let activeKey: StepKey = "C4";
  export let notes: StepNote[] = [];
  export let loop: StepLoop = { start: 1, end: 16 };
  export let bars = 4;
  export let onChange: ((detail: StepChangeDetail) => void) | undefined = undefined;
  export let onCellChange:
    | ((change: Extract<StepChangeDetail, { type: "cell" }>) => void)
    | undefined = undefined;
  export let onKeyChange:
    | ((change: Extract<StepChangeDetail, { type: "key" }>) => void)
    | undefined = undefined;
  export let onKeyPress: ((key: StepKey) => void) | undefined = undefined;
  export let onKeyRelease: ((key: StepKey) => void) | undefined = undefined;
  export let onLoopChange: ((loop: StepLoop) => void) | undefined = undefined;
  export let onNotesChange: ((notes: StepNote[]) => void) | undefined = undefined;

  let className = "";
  let element: HTMLElement & {
    activeKey: StepKey;
    bars: number;
    loop: StepLoop;
    notes: StepNote[];
  };
  export { className as class };

  $: props = parseComponentProps("step-sequencer", { activeKey, bars, loop, notes });
  $: if (element) syncElement();

  function syncElement() {
    element.activeKey = props.activeKey;
    element.bars = props.bars;
    element.loop = props.loop;
    element.notes = props.notes;
  }

  function handleChange(event: Event) {
    const detail = (event as CustomEvent<StepChangeDetail>).detail;
    activeKey = detail.activeKey;
    loop = detail.loop;
    notes = detail.notes;
    onChange?.(detail);
    if (detail.type === "key") {
      onKeyChange?.(detail);
      if (detail.pressed) {
        onKeyPress?.(detail.key);
      } else {
        onKeyRelease?.(detail.key);
      }
    }
    if (detail.type === "loop") onLoopChange?.(detail.loop);
    if (detail.type === "cell") {
      onCellChange?.(detail);
      onNotesChange?.(notes);
    }
  }

  onMount(() => {
    defineElements();
    syncElement();
    element.addEventListener("step-change", handleChange);

    return () => element.removeEventListener("step-change", handleChange);
  });
</script>

<step-sequencer bind:this={element} class={className}></step-sequencer>
