<script lang="ts">
  import { onMount } from "svelte";
  import { defineElements, initUi } from "@patchbay/ui";

  let amount = 0.42;
  let enabled = true;
  let root: HTMLDivElement | undefined;

  onMount(() => {
    if (!root) {
      return;
    }

    defineElements();
    initUi(root);
  });

  $: modulation = Math.min(1, amount + 0.22);
</script>

<div class="[display:grid] w-[min(100%,480px)] place-items-center" bind:this={root}>
  <div
    class="w-[min(100%,440px)] rounded-lg border border-patchbay-border bg-patchbay-panel p-3.5 text-patchbay-text shadow-[inset_0_1px_0_rgba(244,239,225,0.07),0_18px_36px_rgba(0,0,0,0.28)]"
  >
    <div
      class="flex items-center justify-between border-b border-patchbay-gridline pb-3 text-xs text-patchbay-muted"
    >
      <span>Device</span>
      <span>{enabled ? "On" : "Off"}</span>
    </div>

    <div
      class="[display:grid] min-h-[180px] grid-cols-[118px_minmax(0,1fr)] items-center gap-[18px] px-1 py-[18px] [&_.field]:justify-items-center [&_.slider]:[--slider-length:132px] [&_.slider]:[--slider-thickness:40px] max-[520px]:grid-cols-1 max-[520px]:justify-items-center"
    >
      <label class="field">
        <span class="field__label">Filter</span>
        <span
          class="slider"
          data-slider=""
          data-modulation={modulation}
          data-orientation="vertical"
        >
          <input
            aria-label="Filter amount"
            bind:value={amount}
            max="1"
            min="0"
            step="0.01"
            type="range"
          />
        </span>
      </label>

      <div class="[display:grid] justify-items-start gap-3.5">
        <label class="toggle">
          <input
            aria-label="Enable device"
            bind:checked={enabled}
            type="checkbox"
          />
          <span aria-hidden="true"></span>
        </label>

        <button
          class="button is-active"
          type="button"
          aria-label="Trigger"
        ></button>

        <div class="tabs" role="tablist" aria-label="Mode">
          <button
            class="tab is-active"
            type="button"
            role="tab"
            aria-selected="true"
          >
            A
          </button>
          <button
            class="tab"
            type="button"
            role="tab"
            aria-selected="false"
          >
            B
          </button>
        </div>
      </div>
    </div>

    <div
      class="flex items-center justify-between border-t border-patchbay-gridline pt-3 text-xs text-patchbay-muted"
    >
      <span>amount</span>
      <strong class="text-[13px] text-patchbay-modulation">
        {Number(amount).toFixed(2)}
      </strong>
    </div>
  </div>
</div>
