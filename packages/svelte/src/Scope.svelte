<script lang="ts">
  import { onMount } from "svelte";
  import { parseComponentProps } from "@patchbayhq/ui";

  export let samples: number[] = [];
  export let mode: "waveform" | "lissajous" = "waveform";
  export let frozen = false;

  let className = "";
  let canvas: HTMLCanvasElement;
  let hasDrawn = false;
  export { className as class };

  $: props = parseComponentProps("scope", { frozen, mode, samples });
  $: if (canvas && props && (!props.frozen || !hasDrawn)) draw();

  function clampSignal(value: number) {
    return Math.max(-1, Math.min(1, value));
  }

  function draw() {
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#161616";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(255, 255, 255, 0.12)";
    context.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 23) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }

    for (let y = 0; y < canvas.height; y += 24) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }

    const wave = props.samples.length > 0 ? props.samples : Array.from({ length: canvas.width }, () => 0);
    context.strokeStyle = "#9cd8ca";
    context.lineWidth = 2;
    context.beginPath();

    if (props.mode === "lissajous") {
      wave.forEach((sample, index) => {
        const pairedSample = wave[(index + 1) % wave.length] ?? 0;
        const x = canvas.width / 2 + clampSignal(sample) * (canvas.width * 0.38);
        const y = canvas.height / 2 - clampSignal(pairedSample) * (canvas.height * 0.38);
        index === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
      });
    } else {
      wave.forEach((sample, index) => {
        const x = (index / Math.max(1, wave.length - 1)) * canvas.width;
        const y = canvas.height / 2 - clampSignal(sample) * (canvas.height * 0.38);
        index === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
      });
    }

    context.stroke();
    hasDrawn = true;
  }

  onMount(draw);
</script>

<canvas
  bind:this={canvas}
  aria-label="Scope"
  class={["scope", className].filter(Boolean).join(" ")}
  data-frozen={props.frozen ? "true" : undefined}
  data-scope
  data-scope-mode={props.mode}
  width="184"
  height="98"
></canvas>
