<script lang="ts">
  import { parseComponentProps, type EnvelopeShape } from "@patchbay/ui";

  export let envelope: EnvelopeShape = { attack: 0.2, decay: 0.3, release: 0.35, sustain: 0.7 };
  export let disabled = false;
  export let onEnvelopeChange: ((envelope: EnvelopeShape) => void) | undefined = undefined;

  let className = "";
  export { className as class };

  $: props = parseComponentProps("envelope", { disabled, envelope });
  $: attackX = 8 + props.envelope.attack * 54;
  $: decayX = attackX + props.envelope.decay * 70;
  $: sustainY = 88 - props.envelope.sustain * 76;
  $: releaseX = 194 - props.envelope.release * 40;
  $: path = `M8 88 L8 12 L${attackX.toFixed(1)} 12 L${decayX.toFixed(1)} ${sustainY.toFixed(
    1,
  )} C${releaseX.toFixed(1)} ${sustainY.toFixed(1)} 172 75 194 88`;

  function setSustain(event: PointerEvent) {
    if (!onEnvelopeChange || props.disabled) return;
    const target = event.currentTarget as SVGElement;
    const rect = target.ownerSVGElement?.getBoundingClientRect();
    if (!rect) return;

    envelope = {
      ...props.envelope,
      sustain: Math.max(0, Math.min(1, 1 - (event.clientY - rect.top - 12) / 76)),
    };
    onEnvelopeChange(envelope);
  }

  function handleSustainKey(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    envelope = { ...props.envelope, sustain: Math.max(0, Math.min(1, props.envelope.sustain + 0.05)) };
    onEnvelopeChange?.(envelope);
  }
</script>

<div class={["envelope", className].filter(Boolean).join(" ")}>
  <svg data-envelope viewBox="0 0 210 96" role="img" aria-label="ADSR envelope">
    <path class="envelope__grid" d="M1 24H209M1 48H209M1 72H209M42 1V95M84 1V95M126 1V95M168 1V95" />
    <path class="envelope__curve" data-envelope-curve d={path} />
    <rect data-envelope-handle="start" x="4" y="84" width="8" height="8" />
    <rect data-envelope-handle="attack" x={attackX - 4} y="8" width="8" height="8" />
    <circle
      data-envelope-handle="decay"
      cx={decayX}
      cy={sustainY}
      r="4"
      role="button"
      tabindex="0"
      aria-label="Adjust decay"
      on:pointerdown={setSustain}
      on:keydown={handleSustainKey}
    />
    <circle
      data-envelope-handle="sustain"
      cx={releaseX}
      cy={sustainY}
      r="4"
      role="button"
      tabindex="0"
      aria-label="Adjust sustain"
      on:pointerdown={setSustain}
      on:keydown={handleSustainKey}
    />
    <circle data-envelope-handle="release" cx="178" cy="80" r="4" />
    <rect data-envelope-handle="end" x="190" y="84" width="8" height="8" />
  </svg>
</div>
