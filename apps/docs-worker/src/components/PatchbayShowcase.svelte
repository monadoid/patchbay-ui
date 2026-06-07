<script lang="ts">
  import { onMount } from "svelte";
  import {
    Envelope,
    Gain,
    MacroRack,
    Menu,
    Panel,
    PanelHeader,
    PanelSection,
    Scope,
    StatusIndicator,
    type EnvelopeShape,
    type MacroRackMacro,
    type MenuItem,
    type StatusTone,
  } from "@patchbay/svelte";

  type SceneId = "a" | "b";
  type PresetId = "dust" | "glass" | "tape";

  type Scene = {
    cutoff: number;
    drive: number;
    envelope: EnvelopeShape;
    gainDb: number;
    preset: PresetId;
    resonance: number;
  };

  const presetItems = [
    { value: "dust", label: "Dust filter", disabled: false },
    { value: "glass", label: "Glass comb", disabled: false },
    { value: "tape", label: "Tape fold", disabled: false },
  ] satisfies MenuItem[];

  const presetScenes = {
    dust: {
      cutoff: 0.42,
      drive: 0.32,
      envelope: { attack: 0.18, decay: 0.38, release: 0.3, sustain: 0.7 },
      resonance: 0.48,
    },
    glass: {
      cutoff: 0.68,
      drive: 0.24,
      envelope: { attack: 0.1, decay: 0.18, release: 0.48, sustain: 0.48 },
      resonance: 0.78,
    },
    tape: {
      cutoff: 0.34,
      drive: 0.72,
      envelope: { attack: 0.28, decay: 0.52, release: 0.36, sustain: 0.82 },
      resonance: 0.34,
    },
  } satisfies Record<PresetId, Omit<Scene, "gainDb" | "preset">>;

  let audioContext: AudioContext | undefined;
  let driveNode: WaveShaperNode | undefined;
  let filterNode: BiquadFilterNode | undefined;
  let gainNode: GainNode | undefined;
  let oscillator: OscillatorNode | undefined;
  let phase = 0;
  let raf = 0;
  let enabled = true;
  let audioEnabled = false;
  let activeScene: SceneId = "a";
  let statusTone: StatusTone = "active";
  let scenes: Record<SceneId, Scene> = {
    a: {
      ...presetScenes.dust,
      gainDb: -11.5,
      preset: "dust",
    },
    b: {
      ...presetScenes.glass,
      gainDb: -16,
      preset: "glass",
    },
  };

  function clamp(value: number, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
  }

  function updateScene(patch: Partial<Scene>) {
    scenes = {
      ...scenes,
      [activeScene]: {
        ...scenes[activeScene],
        ...patch,
      },
    };
  }

  function applyPreset(value: string) {
    const preset = value as PresetId;
    updateScene({
      ...presetScenes[preset],
      preset,
    });
  }

  function updateMacro(id: string, value: number) {
    if (id === "cutoff") {
      updateScene({ cutoff: value });
      return;
    }

    if (id === "resonance") {
      updateScene({ resonance: value });
      return;
    }

    if (id === "drive") {
      updateScene({ drive: value });
    }
  }

  function dbToGain(valueDb: number) {
    return 10 ** (valueDb / 20);
  }

  function envelopeLevel(position: number, envelope: EnvelopeShape) {
    const attackEnd = 0.08 + envelope.attack * 0.18;
    const decayEnd = attackEnd + 0.08 + envelope.decay * 0.22;
    const releaseStart = 0.74 - envelope.release * 0.18;

    if (position < attackEnd) {
      return position / attackEnd;
    }

    if (position < decayEnd) {
      const decayProgress = (position - attackEnd) / (decayEnd - attackEnd);
      return 1 - decayProgress * (1 - envelope.sustain);
    }

    if (position > releaseStart) {
      const releaseProgress = (position - releaseStart) / (1 - releaseStart);
      return Math.max(0, envelope.sustain * (1 - releaseProgress));
    }

    return envelope.sustain;
  }

  function inputSample(position: number, time: number) {
    const p = (position + time * 0.08) % 1;
    return (
      Math.sin(p * Math.PI * 2 * 1.5) * 0.72 +
      Math.sin((p + 0.16) * Math.PI * 2 * 3) * 0.18
    );
  }

  function outputSample(position: number, time: number, scene: Scene) {
    const input = inputSample(position, time);
    const harmonic = 1 + Math.round(scene.resonance * 5);
    const formant = Math.sin((position + time * 0.12) * Math.PI * 2 * harmonic);
    const fold = Math.sin((input + scene.drive * 0.22) * Math.PI * (1.2 + scene.drive * 2.2));
    const filtered =
      input * (0.22 + scene.cutoff * 0.84) +
      formant * scene.resonance * (scene.preset === "glass" ? 0.36 : 0.24) +
      fold * (scene.preset === "tape" ? 0.3 : 0.12);
    const driven = Math.tanh(filtered * (1.15 + scene.drive * 6.4));
    const envelope = 0.24 + envelopeLevel(position, scene.envelope) * 0.76;
    const gainScale = clamp(dbToGain(scene.gainDb) * 2.4, 0, 1.8);

    return clamp(driven * envelope * gainScale * (enabled ? 1 : 0.12), -1, 1);
  }

  function makeInputSamples(time: number) {
    return Array.from({ length: 96 }, (_, index) =>
      clamp(inputSample(index / 95, time), -1, 1),
    );
  }

  function makeOutputSamples(scene: Scene, time: number) {
    return Array.from({ length: 96 }, (_, index) => {
      return outputSample(index / 95, time, scene);
    });
  }

  function createDriveCurve(amount: number) {
    const curve = new Float32Array(256);
    const drive = 1 + amount * 24;

    for (let index = 0; index < curve.length; index += 1) {
      const x = (index / (curve.length - 1)) * 2 - 1;
      curve[index] = Math.tanh(x * drive) / Math.tanh(drive);
    }

    return curve;
  }

  function stopAudio() {
    audioEnabled = false;

    try {
      oscillator?.stop();
    } catch {
      // The oscillator may already be stopped.
    }

    void audioContext?.close();
    audioContext = undefined;
    driveNode = undefined;
    filterNode = undefined;
    gainNode = undefined;
    oscillator = undefined;
  }

  async function startAudio() {
    if (audioEnabled) {
      return;
    }

    const context = new AudioContext();
    const nextOscillator = context.createOscillator();
    const nextFilter = context.createBiquadFilter();
    const nextDrive = context.createWaveShaper();
    const nextGain = context.createGain();

    nextOscillator.type = "sawtooth";
    nextFilter.type = "lowpass";
    nextDrive.oversample = "4x";
    nextGain.gain.value = 0;

    nextOscillator.connect(nextFilter);
    nextFilter.connect(nextDrive);
    nextDrive.connect(nextGain);
    nextGain.connect(context.destination);
    nextOscillator.start();

    audioContext = context;
    oscillator = nextOscillator;
    filterNode = nextFilter;
    driveNode = nextDrive;
    gainNode = nextGain;
    audioEnabled = true;
    await context.resume();
    updateAudioNodes(scene, outputLevel, phase, enabled);
  }

  function setAudio(nextAudioEnabled: boolean) {
    if (nextAudioEnabled) {
      void startAudio();
    } else {
      stopAudio();
    }
  }

  function updateAudioNodes(
    currentScene: Scene,
    currentOutputLevel: number,
    currentPhase: number,
    currentEnabled: boolean,
  ) {
    if (!audioContext || !oscillator || !filterNode || !driveNode || !gainNode) {
      return;
    }

    const now = audioContext.currentTime;
    const liveEnvelope = envelopeLevel((currentPhase * 0.72) % 1, currentScene.envelope);
    const presetFrequency =
      currentScene.preset === "glass" ? 128 : currentScene.preset === "tape" ? 72 : 88;
    const frequency = presetFrequency + currentScene.cutoff * 170 + liveEnvelope * 34;
    const cutoffHz =
      130 +
      currentScene.cutoff * currentScene.cutoff * 7800 +
      liveEnvelope * (900 + currentScene.resonance * 1300);
    const oscillatorType: OscillatorType =
      currentScene.preset === "glass" ? "triangle" : currentScene.preset === "tape" ? "square" : "sawtooth";
    const filterType: BiquadFilterType =
      currentScene.preset === "glass" ? "bandpass" : currentScene.preset === "tape" ? "highpass" : "lowpass";
    const outputGain = currentEnabled
      ? Math.min(
          0.34,
          dbToGain(currentScene.gainDb) *
            (0.08 + liveEnvelope * 0.72) *
            (0.44 + currentOutputLevel * 0.64),
        )
      : 0;

    oscillator.type = oscillatorType;
    filterNode.type = filterType;
    oscillator.frequency.setTargetAtTime(frequency, now, 0.035);
    filterNode.frequency.setTargetAtTime(cutoffHz, now, 0.035);
    filterNode.Q.setTargetAtTime(0.6 + currentScene.resonance * 22, now, 0.035);
    driveNode.curve = createDriveCurve(currentScene.drive * (currentScene.preset === "tape" ? 1.25 : 1));
    gainNode.gain.setTargetAtTime(outputGain, now, 0.05);
  }

  onMount(() => {
    let lastTime = performance.now();

    function animate(time: number) {
      const delta = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;
      phase = (phase + delta * (enabled ? 1 : 0.22)) % 1000;
      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      stopAudio();
    };
  });

  $: scene = scenes[activeScene];
  $: envelopeNow = envelopeLevel((phase * 0.72) % 1, scene.envelope);
  $: gainEnergy = clamp(dbToGain(scene.gainDb) * 2.4, 0, 1.16);
  $: outputLevel = enabled
    ? clamp(
        (0.12 +
          scene.cutoff * 0.22 +
          scene.drive * 0.34 +
          scene.resonance * 0.2 +
          envelopeNow * 0.24 +
          (0.5 + Math.sin(phase * Math.PI * 2.4) * 0.5) * 0.1) *
          gainEnergy,
      )
    : 0.02;
  $: inputSamples = makeInputSamples(phase);
  $: outputSamples = makeOutputSamples(scene, phase);
  $: statusTone = enabled ? "active" : "idle";
  $: macros = [
    { id: "cutoff", label: "Freq", value: scene.cutoff },
    { id: "resonance", label: "Q", value: scene.resonance },
    { id: "drive", label: "Drive", value: scene.drive },
  ] satisfies MacroRackMacro[];
  $: if (audioEnabled) updateAudioNodes(scene, outputLevel, phase, enabled);
</script>

<div class="[display:grid] w-[min(100%,580px)] place-items-center">
  <Panel
    compact
    class="w-[min(100%,560px)]"
    style="--panel-color:#343531; --text-color:#f4efe1; --muted-text-color:#bcb6a7; --modulation-color:#9cd8ca; --control-radius:4px; padding:16px;"
  >
    <PanelHeader eyebrow="Device" title="drift filter">
      <button
        aria-pressed={audioEnabled}
        class={[
          "min-h-[18px] rounded-[2px] border px-2 text-[10px] leading-none transition-colors",
          audioEnabled
            ? "border-[var(--modulation-color)] bg-[var(--modulation-color)] text-[#06120b]"
            : "border-[#454640] bg-[#242520] text-[var(--muted-text-color)]",
        ].join(" ")}
        type="button"
        on:click={() => setAudio(!audioEnabled)}
      >
        {audioEnabled ? "Audio on" : "Muted"}
      </button>
      <StatusIndicator
        label="visual"
        pulse={enabled}
        tone={statusTone}
      />
    </PanelHeader>

    <PanelSection>
      <div
        class="[display:grid] grid-cols-[minmax(0,1fr)_168px_minmax(0,1fr)] items-center gap-2.5 max-[620px]:grid-cols-1 max-[620px]:justify-items-center"
      >
        <div class="[display:grid] gap-1 max-[620px]:justify-items-center">
          <span class="text-[10px] leading-none text-[var(--muted-text-color)] uppercase">input</span>
          <Scope
            samples={inputSamples}
            mode="waveform"
            class="![block-size:88px] ![inline-size:142px]"
          />
        </div>

        <div class="[display:grid] min-w-0 gap-2">
          <div class="[display:grid] gap-1">
            <span class="text-[10px] leading-none text-[var(--muted-text-color)] uppercase">shape</span>
            <div class="[display:grid] gap-0">
              <Envelope
                envelope={scene.envelope}
                disabled={!enabled}
                onEnvelopeChange={(envelope) => updateScene({ envelope })}
                class="![block-size:72px] ![inline-size:100%] !rounded-b-none"
              />

              <MacroRack
                columns={3}
                disabled={!enabled}
                label="Filter macros"
                {macros}
                onMacroChange={updateMacro}
                class="!rounded-t-none !border-t-0 !p-2 [&_.dial]:![--dial-size:30px] [&_.field]:!gap-1 [&_.field\_\_label]:!text-[10px]"
              />
            </div>
          </div>

          <Menu
            items={presetItems}
            value={scene.preset}
            disabled={!enabled}
            onValueChange={applyPreset}
            class="![inline-size:100%] [&_.menu\_\_button]:![inline-size:100%]"
          />
        </div>

        <div class="[display:grid] gap-1 max-[620px]:justify-items-center">
          <span class="pl-[30px] text-[10px] leading-none text-[var(--muted-text-color)] uppercase max-[620px]:pl-0">output</span>
          <div class="[display:grid] grid-cols-[30px_142px] items-start gap-0">
            <Gain
              valueDb={scene.gainDb}
              level={outputLevel}
              thumbSide="left"
              disabled={!enabled}
              onValueDbChange={(gainDb) => updateScene({ gainDb })}
              class="gain--flush ![block-size:88px] ![inline-size:30px] [&_.gain\_\_readout]:!hidden"
            />
            <Scope
              samples={outputSamples}
              mode="waveform"
              class="![block-size:88px] ![inline-size:142px]"
            />
          </div>
        </div>
      </div>
    </PanelSection>
  </Panel>
</div>
