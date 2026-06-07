<script lang="ts">
  import { parseComponentProps } from "@patchbay/ui";
  import { ratio } from "./shared";

  export let valueDb = -12;
  export let minDb = -70;
  export let maxDb = 6;
  export let stepDb = 0.1;
  export let level = 0;
  export let disabled = false;
  export let onValueDbChange: ((valueDb: number) => void) | undefined = undefined;

  let className = "";
  export { className as class };

  $: props = parseComponentProps("gain", { disabled, level, maxDb, minDb, stepDb, valueDb });
  $: gainRatio = ratio(props.valueDb, props.minDb, props.maxDb);

  function handleInput(event: Event) {
    valueDb = Number((event.currentTarget as HTMLInputElement).value);
    onValueDbChange?.(valueDb);
  }
</script>

<label
  class={["gain", className].filter(Boolean).join(" ")}
  data-gain
  style={`--gain-value: ${gainRatio}; --gain-signal: ${props.level}`}
>
  <input
    aria-label="Gain"
    type="range"
    min={props.minDb}
    max={props.maxDb}
    step={props.stepDb}
    bind:value={valueDb}
    disabled={props.disabled}
    on:input={handleInput}
  />
  <span class="gain__signal" data-gain-signal aria-hidden="true"></span>
  <span class="gain__thumb" aria-hidden="true"></span>
  <span class="gain__readout" data-gain-readout>{props.valueDb.toFixed(1)} dB</span>
</label>
