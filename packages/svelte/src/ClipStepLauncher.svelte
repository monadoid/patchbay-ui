<script lang="ts">
  import type {
    StepChangeDetail,
    StepKey,
    StepLoop,
    StepNote,
  } from "@patchbayhq/ui";
  import StepSequencer from "./StepSequencer.svelte";
  import Panel from "./Panel.svelte";
  import PanelHeader from "./PanelHeader.svelte";
  import StatusIndicator from "./StatusIndicator.svelte";
  import type { StatusTone } from "./composites";

  export let activeKey: StepKey = "C4";
  export let bars = 4;
  export let clipName = "Pattern";
  export let disabled = false;
  export let launchLabel = "Launch";
  export let loop: StepLoop = { start: 1, end: 16 };
  export let notes: StepNote[] = [];
  export let onCellChange:
    | ((change: Extract<StepChangeDetail, { type: "cell" }>) => void)
    | undefined = undefined;
  export let onChange: ((detail: StepChangeDetail) => void) | undefined = undefined;
  export let onKeyChange:
    | ((change: Extract<StepChangeDetail, { type: "key" }>) => void)
    | undefined = undefined;
  export let onKeyPress: ((key: StepKey) => void) | undefined = undefined;
  export let onKeyRelease: ((key: StepKey) => void) | undefined = undefined;
  export let onLaunch: (() => void) | undefined = undefined;
  export let onLoopChange: ((loop: StepLoop) => void) | undefined = undefined;
  export let onNotesChange: ((notes: StepNote[]) => void) | undefined = undefined;
  export let onStop: (() => void) | undefined = undefined;
  export let playing = false;
  export let statusLabel = "Clip";
  export let statusTone: StatusTone | undefined = undefined;
  export let statusValue: string | undefined = undefined;
  export let stopLabel = "Stop";
  export let title = "Step launcher";

  let className = "";
  export { className as class };

  $: resolvedStatusTone = statusTone ?? (playing ? "active" : "idle");
  $: resolvedStatusValue = statusValue ?? (playing ? "Playing" : "Ready");

  function handleLaunch() {
    onLaunch?.();
  }

  function handleStop() {
    onStop?.();
  }
</script>

<Panel class={["clip-step-launcher", className].filter(Boolean).join(" ")}>
  <PanelHeader {title} subtitle={clipName}>
    <StatusIndicator
      label={statusLabel}
      pulse={playing}
      tone={resolvedStatusTone}
      value={resolvedStatusValue}
    />
  </PanelHeader>

  <div class="clip-step-launcher__transport">
    <button
      class="text-button clip-step-launcher__launch"
      data-appearance="primary"
      {disabled}
      on:click={handleLaunch}
      type="button"
    >
      <span class="text-button__label">{launchLabel}</span>
    </button>
    <button
      class="text-button clip-step-launcher__stop"
      data-appearance="subtle"
      {disabled}
      on:click={handleStop}
      type="button"
    >
      <span class="text-button__label">{stopLabel}</span>
    </button>
  </div>

  <StepSequencer
    class="clip-step-launcher__steps"
    bind:activeKey
    bind:loop
    bind:notes
    {bars}
    {onCellChange}
    {onChange}
    {onKeyChange}
    {onKeyPress}
    {onKeyRelease}
    {onLoopChange}
    {onNotesChange}
  />

  <div class="clip-step-launcher__extra">
    <slot />
  </div>
</Panel>
