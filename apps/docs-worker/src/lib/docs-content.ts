import type {
  CodeVariantId,
  CodeVariantSection,
  CodeVariantSource,
} from "./code-variants";

const frameworkVariantIds = [
  "js",
  "react",
  "svelte",
] as const satisfies readonly CodeVariantId[];

type ComponentExampleInput = {
  description: string;
  html: string;
  id: string;
  name: string;
  react: string;
  script?: string;
  svelte: string;
  title: string;
};

export type ComponentExample = ComponentExampleInput & {
  code: string;
  codeVariants: CodeVariantSource[];
  language: "html";
  markdown: string;
};

function trimCode(code: string) {
  return code.trim();
}

function scriptBlock(script: string) {
  return `<script>
${trimCode(script)}
</script>`;
}

function createExampleCode(example: ComponentExampleInput) {
  const html = trimCode(example.html);
  return example.script ? `${html}\n\n${scriptBlock(example.script)}` : html;
}

function createCodeVariants(
  example: ComponentExampleInput,
): CodeVariantSource[] {
  const byVariant = {
    js: {
      code: createExampleCode(example),
      language: "html",
    },
    react: {
      code: trimCode(example.react),
      language: "tsx",
    },
    svelte: {
      code: trimCode(example.svelte),
      language: "svelte",
    },
  } satisfies Record<CodeVariantId, Omit<CodeVariantSource, "id">>;

  return frameworkVariantIds.map((id) => ({
    ...byVariant[id],
    id,
  }));
}

function codeFenceLanguage(variant: CodeVariantSource) {
  return variant.language;
}

function variantsMarkdown(variants: readonly CodeVariantSource[]) {
  return variants
    .map((variant) => {
      const heading = `### ${variant.label ?? variant.id.toUpperCase()}`;

      if (variant.sections?.length) {
        return `${heading}

\`\`\`text
${variant.code}
\`\`\``;
      }

      return `${heading}

\`\`\`${codeFenceLanguage(variant)}
${variant.code}
\`\`\``;
    })
    .join("\n\n");
}

function componentMarkdown(example: ComponentExampleInput) {
  const variants = createCodeVariants(example);

  return `## ${example.title}

${example.description}

${variantsMarkdown(variants)}
`;
}

function createExample(example: ComponentExampleInput): ComponentExample {
  return {
    ...example,
    code: createExampleCode(example),
    codeVariants: createCodeVariants(example),
    language: "html",
    markdown: componentMarkdown(example),
  };
}

function executableScript(body: string) {
  return `{
  const root = document.currentScript.closest("[data-patchbay-example]") ?? document;
  const cleanup = new AbortController();
  root.addEventListener("patchbay-example-cleanup", () => cleanup.abort(), { once: true });

${body
  .trim()
  .split("\n")
  .map((line) => `  ${line}`)
  .join("\n")}
}`;
}

const tailwindThemeBody = `
:root {
  --control-bg: #242520;
  --text-color: #f4efe1;
  --muted-text-color: #bcb6a7;
  --panel-color: #3b3b3b;
  --modulation-color: #9cd8ca;
  --control-radius: 4px;
}

.device-shell {
  @apply bg-patchbay-panel text-patchbay-text font-patchbay rounded-patchbay;
}`;

function setupComment(lines: string[]) {
  return lines.map((line) => `# ${line}`).join("\n");
}

function setupCommentLines(index: number, section: CodeVariantSection) {
  return [
    `${index + 1}. ${section.title}`,
    ...(section.file ? [`File: ${section.file}`] : []),
  ];
}

function createCommentedSetupSections(sections: readonly CodeVariantSection[]) {
  return sections.map((section, index) => ({
    ...section,
    code: `${setupComment(setupCommentLines(index, section))}\n${trimCode(
      section.code,
    )}`,
  }));
}

function setupCopy(sections: readonly CodeVariantSection[]) {
  return sections.map((section) => trimCode(section.code)).join("\n\n");
}

function createSetupVariant({
  id,
  sections,
}: {
  id: CodeVariantId;
  sections: CodeVariantSection[];
}): CodeVariantSource {
  const commentedSections = createCommentedSetupSections(sections);

  return {
    code: setupCopy(commentedSections),
    id,
    language: "text",
    sections: commentedSections,
  };
}

const vanillaSetupSections = [
  {
    code: "pnpm add @patchbay/ui",
    language: "bash",
    title: "Install",
  },
  {
    code: `
import "@patchbay/ui/styles.css";
import { defineElements, initUi } from "@patchbay/ui";

const device = document.querySelector("[data-patchbay-device]");

defineElements();
if (device) initUi(device);
`,
    file: "src/main.ts",
    language: "ts",
    title: "Add the base CSS and initialize controls",
  },
  {
    code: `
<section class="device-shell" data-patchbay-device>
  <label class="field">
    <span class="field__label">Filter</span>
    <span class="slider" data-slider data-orientation="vertical" data-modulation="0.64">
      <input type="range" min="0" max="1" step="0.01" value="0.42" aria-label="Filter" />
    </span>
  </label>
</section>
`,
    file: "index.html",
    language: "html",
    title: "Use a component",
  },
  {
    code: `
@import "tailwindcss";
@import "@patchbay/ui/styles.css";
@import "@patchbay/ui/tailwind.css";
${tailwindThemeBody}
`,
    file: "src/styles.css",
    language: "css",
    title: "Optional Tailwind theme",
  },
] satisfies CodeVariantSection[];

const reactSetupSections = [
  {
    code: "pnpm add @patchbay/react",
    language: "bash",
    title: "Install",
  },
  {
    code: 'import "@patchbay/react/styles.css";',
    file: "app/layout.tsx, src/main.tsx, or another global entry",
    language: "tsx",
    title: "Add the base CSS once",
  },
  {
    code: `
import { Slider } from "@patchbay/react";

export function DevicePanel() {
  return <Slider label="Filter" value={0.42} modulation={0.64} orientation="vertical" />;
}
`,
    file: "any React component",
    language: "tsx",
    title: "Use a component",
  },
  {
    code: `
@import "tailwindcss";
@import "@patchbay/react/styles.css";
@import "@patchbay/react/tailwind.css";
${tailwindThemeBody}
`,
    file: "app/globals.css or src/index.css",
    language: "css",
    title: "Optional Tailwind theme",
  },
] satisfies CodeVariantSection[];

const svelteSetupSections = [
  {
    code: "pnpm add @patchbay/svelte",
    language: "bash",
    title: "Install",
  },
  {
    code: `
<script lang="ts">
  import "@patchbay/svelte/styles.css";
</script>
`,
    file: "src/routes/+layout.svelte or src/App.svelte",
    language: "svelte",
    title: "Add the base CSS once",
  },
  {
    code: `
<script lang="ts">
  import { Slider } from "@patchbay/svelte";

  let value = 0.42;
</script>

<Slider label="Filter" bind:value modulation={0.64} orientation="vertical" />
`,
    file: "any Svelte component",
    language: "svelte",
    title: "Use a component",
  },
  {
    code: `
@import "tailwindcss";
@import "@patchbay/svelte/styles.css";
@import "@patchbay/svelte/tailwind.css";
${tailwindThemeBody}
`,
    file: "src/app.css",
    language: "css",
    title: "Optional Tailwind theme",
  },
] satisfies CodeVariantSection[];

export const getStartedVariants = [
  createSetupVariant({
    id: "js",
    sections: vanillaSetupSections,
  }),
  createSetupVariant({
    id: "react",
    sections: reactSetupSections,
  }),
  createSetupVariant({
    id: "svelte",
    sections: svelteSetupSections,
  }),
] satisfies CodeVariantSource[];

export const componentExamples = [
  createExample({
    id: "panel-shell",
    name: "Panel",
    title: "panel shell",
    description: "Device shell primitives for headers, sections, and status.",
    react: `
import { Panel, PanelHeader, PanelSection, StatusIndicator, Toggle } from "@patchbay/react";

export function DeviceShell() {
  return (
    <Panel>
      <PanelHeader
        title="Granular Delay"
        subtitle="Input bus A"
        status={<StatusIndicator label="DSP" value="Running" tone="active" pulse />}
      />
      <PanelSection title="Device">
        <Toggle label="Enabled" checked />
      </PanelSection>
    </Panel>
  );
}
`,
    svelte: `
<script lang="ts">
  import { Panel, PanelHeader, PanelSection, StatusIndicator, Toggle } from "@patchbay/svelte";
</script>

<Panel>
  <PanelHeader title="Granular Delay" subtitle="Input bus A">
    <StatusIndicator label="DSP" value="Running" tone="active" pulse />
  </PanelHeader>
  <PanelSection title="Device">
    <Toggle label="Enabled" checked />
  </PanelSection>
</Panel>
`,
    html: `
<section class="panel" aria-label="Granular Delay">
  <header class="panel-header">
    <div class="panel-header__main">
      <h3 class="panel-header__title">Granular Delay</h3>
      <p class="panel-header__subtitle">Input bus A</p>
    </div>
    <div class="panel-header__actions">
      <span class="status-indicator" data-tone="active" data-pulse="true">
        <span class="status-indicator__dot" aria-hidden="true"></span>
        <span class="status-indicator__label">DSP</span>
        <strong class="status-indicator__value">Running</strong>
      </span>
    </div>
  </header>
  <section class="panel-section">
    <div class="panel-section__header">
      <h4 class="panel-section__title">Device</h4>
    </div>
    <div class="panel-section__body">
      <label class="toggle">
        <input type="checkbox" checked aria-label="Enabled" />
        <span aria-hidden="true"></span>
      </label>
    </div>
  </section>
</section>
`,
  }),
  createExample({
    id: "slider",
    name: "slider",
    title: "slider",
    description: "A native range input styled as a compact parameter slider.",
    react: `
import { Slider } from "@patchbay/react";

export function FilterSlider() {
  return <Slider label="Filter" value={0.42} modulation={0.64} orientation="vertical" />;
}
`,
    svelte: `
<script lang="ts">
  import { Slider } from "@patchbay/svelte";

  let value = 0.42;
</script>

<Slider label="Filter" bind:value modulation={0.64} orientation="vertical" />
`,
    html: `
<label class="field">
  <span class="field__label">Filter</span>
  <span class="slider" data-slider data-orientation="vertical" data-modulation="0.64">
    <input type="range" min="0" max="1" step="0.01" value="0.42" aria-label="Filter" />
  </span>
</label>
`,
  }),
  createExample({
    id: "dial",
    name: "dial",
    title: "dial",
    description: "A compact macro dial driven by a range input.",
    react: `
import { useState } from "react";
import { Dial } from "@patchbay/react";

export function MacroDial() {
  const [value, setValue] = useState(0.62);

  return <Dial label="Macro" value={value} onValueChange={setValue} />;
}
`,
    svelte: `
<script lang="ts">
  import { Dial } from "@patchbay/svelte";

  let value = 0.62;
</script>

<Dial label="Macro" bind:value />
`,
    html: `
<label class="field">
  <span class="field__label">Macro</span>
  <span class="dial" data-dial>
    <input type="range" min="0" max="1" step="0.01" value="0.62" aria-label="Macro" />
  </span>
</label>
`,
    script: executableScript(`
const dial = root.querySelector("[data-dial]");
const input = dial.querySelector("input");

function ratioFromRange() {
  return (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min));
}

function syncDial() {
  dial.style.setProperty("--dial-value", String(ratioFromRange()));
}

input.addEventListener("input", syncDial, { signal: cleanup.signal });
syncDial();
`),
  }),
  createExample({
    id: "toggle",
    name: "toggle",
    title: "toggle",
    description: "A checkbox-backed toggle with shared appearance states.",
    react: `
import { useState } from "react";
import { Toggle } from "@patchbay/react";

export function EnableToggle() {
  const [checked, setChecked] = useState(true);

  return <Toggle label="Enabled" checked={checked} appearance="primary" onCheckedChange={setChecked} />;
}
`,
    svelte: `
<script lang="ts">
  import { Toggle } from "@patchbay/svelte";

  let checked = true;
</script>

<Toggle label="Enabled" appearance="primary" bind:checked />
`,
    html: `
<label class="toggle" data-appearance="primary">
  <input type="checkbox" checked aria-label="Enabled" />
  <span aria-hidden="true"></span>
</label>
`,
  }),
  createExample({
    id: "button",
    name: "button",
    title: "button",
    description: "A square momentary control with shared appearance states.",
    react: `
import { Button } from "@patchbay/react";

export function TriggerButton() {
  return <Button label="Trigger" mode="momentary" appearance="primary" onPressedChange={(pressed) => console.log(pressed)} />;
}
`,
    svelte: `
<script lang="ts">
  import { Button } from "@patchbay/svelte";

  function handlePressedChange(pressed: boolean) {
    console.log(pressed);
  }
</script>

<Button label="Trigger" mode="momentary" appearance="primary" onPressedChange={handlePressedChange} />
`,
    html: `
<button class="button" data-appearance="primary" type="button" aria-label="Trigger"></button>
`,
    script: executableScript(`
const button = root.querySelector(".button");
button.addEventListener("pointerdown", () => button.classList.add("is-active"), { signal: cleanup.signal });
button.addEventListener("pointerup", () => button.classList.remove("is-active"), { signal: cleanup.signal });
button.addEventListener("pointerleave", () => button.classList.remove("is-active"), { signal: cleanup.signal });
`),
  }),
  createExample({
    id: "text-button",
    name: "text-button",
    title: "text button",
    description: "A small command button with text, icon, or picture content.",
    react: `
import { useState } from "react";
import { TextButton } from "@patchbay/react";

export function TriggerTextButton() {
  const [value, setValue] = useState(false);

  return (
    <TextButton
      value={value}
      icon="▶"
      appearance="primary"
      labels={{ off: "Trigger", on: "Triggered" }}
      onValueChange={setValue}
    />
  );
}
`,
    svelte: `
<script lang="ts">
  import { TextButton } from "@patchbay/svelte";

  let value = false;
</script>

<TextButton
  bind:value
  icon="▶"
  appearance="primary"
  labels={{ off: "Trigger", on: "Triggered" }}
/>
`,
    html: `
<button class="text-button" data-appearance="primary" type="button">
  <span class="text-button__icon" aria-hidden="true">▶</span>
  <span class="text-button__label">Trigger</span>
</button>
`,
  }),
  createExample({
    id: "label",
    name: "label",
    title: "comment",
    description: "Plain device text using the same scale and color.",
    react: `
import { Label } from "@patchbay/react";

export function ParameterNote() {
  return <Label text="Parameter note" />;
}
`,
    svelte: `
<script lang="ts">
  import { Label } from "@patchbay/svelte";
</script>

<Label text="Parameter note" />
`,
    html: `
<p class="label">Parameter note</p>
`,
  }),
  createExample({
    id: "tabs",
    name: "tabs",
    title: "tab",
    description: "A compact segmented tab group.",
    react: `
import { useState } from "react";
import { Tabs } from "@patchbay/react";

const items = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
  { value: "three", label: "Three" },
];

export function ModeTabs() {
  const [value, setValue] = useState("one");

  return <Tabs value={value} items={items} onValueChange={setValue} />;
}
`,
    svelte: `
<script lang="ts">
  import { Tabs } from "@patchbay/svelte";

  let value = "one";
  const items = [
    { value: "one", label: "One" },
    { value: "two", label: "Two" },
    { value: "three", label: "Three" },
  ];
</script>

<Tabs bind:value {items} />
`,
    html: `
<div class="tabs" role="tablist" aria-label="Mode">
  <button class="tab is-active" type="button" role="tab" aria-selected="true">One</button>
  <button class="tab" type="button" role="tab" aria-selected="false">Two</button>
  <button class="tab" type="button" role="tab" aria-selected="false">Three</button>
</div>
`,
    script: executableScript(`
const tabs = Array.from(root.querySelectorAll(".tab"));
tabs.forEach((button) => {
  button.addEventListener(
    "click",
    () => {
      tabs.forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
      });
    },
    { signal: cleanup.signal },
  );
});
`),
  }),
  createExample({
    id: "menu",
    name: "menu",
    title: "menu",
    description: "A custom listbox menu with controllable styling and keyboard focus.",
    react: `
import { useState } from "react";
import { Menu } from "@patchbay/react";

const items = [
  { value: "classic", label: "Classic" },
  { value: "bright", label: "Bright" },
  { value: "muted", label: "Muted" },
];

export function ModeMenu() {
  const [value, setValue] = useState("classic");

  return <Menu value={value} items={items} onValueChange={setValue} />;
}
`,
    svelte: `
<script lang="ts">
  import { Menu } from "@patchbay/svelte";

  let value = "classic";
  const items = [
    { value: "classic", label: "Classic" },
    { value: "bright", label: "Bright" },
    { value: "muted", label: "Muted" },
  ];
</script>

<Menu bind:value {items} />
`,
    html: `
<div class="menu" data-menu data-open="true" data-value="classic">
  <button class="menu__button" type="button" aria-haspopup="listbox" aria-expanded="true">
    <span class="menu__value">Classic</span>
    <span class="menu__chevron" aria-hidden="true"></span>
  </button>
  <div class="menu__list" role="listbox" aria-label="Mode">
    <button class="menu__option is-selected" data-value="classic" type="button" role="option" aria-selected="true">Classic</button>
    <button class="menu__option is-active" data-value="bright" type="button" role="option" aria-selected="false">Bright</button>
    <button class="menu__option" data-value="muted" type="button" role="option" aria-selected="false">Muted</button>
  </div>
</div>
`,
  }),
  createExample({
    id: "arrows",
    name: "arrows",
    title: "arrows",
    description: "A two-button arrow stepper.",
    react: `
import { useState } from "react";
import { Arrows, type ArrowDirection } from "@patchbay/react";

export function DirectionArrows() {
  const [value, setValue] = useState<ArrowDirection>("right");

  return <Arrows value={value} onValueChange={setValue} />;
}
`,
    svelte: `
<script lang="ts">
  import { Arrows, type ArrowDirection } from "@patchbay/svelte";

  let value: ArrowDirection = "right";
</script>

<Arrows bind:value />
`,
    html: `
<div class="arrows" role="group" aria-label="Arrows">
  <button type="button" aria-label="Left"></button>
  <button type="button" aria-label="Right"></button>
</div>
`,
  }),
  createExample({
    id: "drop",
    name: "drop",
    title: "drop",
    description: "A file input styled as a compact drop target.",
    react: `
import { Drop } from "@patchbay/react";

export function SampleDrop() {
  return <Drop label="Drop file" accept={["audio/wav", "audio/aiff"]} onFilesChange={console.log} />;
}
`,
    svelte: `
<script lang="ts">
  import { Drop } from "@patchbay/svelte";

  function handleFilesChange(files: FileList) {
    console.log(files);
  }
</script>

<Drop label="Drop file" accept={["audio/wav", "audio/aiff"]} onFilesChange={handleFilesChange} />
`,
    html: `
<label class="drop">
  <input type="file" aria-label="Drop file" />
  <span aria-hidden="true"></span>
</label>
`,
  }),
  createExample({
    id: "line",
    name: "line",
    title: "line",
    description: "Horizontal and vertical divider primitives.",
    react: `
import { Line } from "@patchbay/react";

export function Dividers() {
  return (
    <>
      <Line orientation="horizontal" length={170} />
      <Line orientation="vertical" length={48} />
    </>
  );
}
`,
    svelte: `
<script lang="ts">
  import { Line } from "@patchbay/svelte";
</script>

<Line orientation="horizontal" length={170} />
<Line orientation="vertical" length={48} />
`,
    html: `
<div class="line-set" aria-label="Lines">
  <span class="line"></span>
  <span class="line line--vertical"></span>
</div>
`,
  }),
  createExample({
    id: "number-box",
    name: "number-box",
    title: "number box",
    description: "A native number input with device styling.",
    react: `
import { useState } from "react";
import { NumberBox } from "@patchbay/react";

export function MidiNumber() {
  const [value, setValue] = useState(64);

  return <NumberBox label="Number" value={value} min={0} max={127} onValueChange={setValue} />;
}
`,
    svelte: `
<script lang="ts">
  import { NumberBox } from "@patchbay/svelte";

  let value = 64;
</script>

<NumberBox label="Number" bind:value min={0} max={127} />
`,
    html: `
<input class="number-box" type="number" min="0" max="127" value="64" aria-label="Number" />
`,
  }),
  createExample({
    id: "grid",
    name: "grid",
    title: "grid",
    description:
      "A sequencer-style grid with note markers and direction controls.",
    react: `
import { useState } from "react";
import { Grid, type GridProps } from "@patchbay/react";

const initialCells: GridProps["cells"] = Array.from({ length: 16 }, (_, index) => ({
  active: [1, 5, 9, 10, 14].includes(index),
  y: [0.72, 0.36, 0.58, 0.22, 0.44][index % 5] ?? 0.5,
  color: "blue",
}));

export function PatternGrid() {
  const [cells, setCells] = useState(initialCells);
  const [directions, setDirections] = useState<GridProps["directions"]>(
    Array.from({ length: 16 }, (_, index) => (index === 5 ? "left" : index === 11 ? "off" : "right")),
  );

  return (
    <Grid
      cells={cells}
      directions={directions}
      measureSize={4}
      onCellsChange={setCells}
      onDirectionsChange={setDirections}
    />
  );
}
`,
    svelte: `
<script lang="ts">
  import { Grid, type GridProps } from "@patchbay/svelte";

  let cells: GridProps["cells"] = Array.from({ length: 16 }, (_, index) => ({
    active: [1, 5, 9, 10, 14].includes(index),
    y: [0.72, 0.36, 0.58, 0.22, 0.44][index % 5] ?? 0.5,
    color: "blue",
  }));
  let directions: GridProps["directions"] = Array.from(
    { length: 16 },
    (_, index) => (index === 5 ? "left" : index === 11 ? "off" : "right"),
  );
</script>

<Grid bind:cells bind:directions measureSize={4} />
`,
    html: `
<sequencer-grid id="pattern" aria-label="Grid"></sequencer-grid>
`,
    script: executableScript(`
const grid = root.querySelector("#pattern");

grid.cells = Array.from({ length: 16 }, (_, index) => ({
  active: [1, 5, 9, 10, 14].includes(index),
  y: [0.72, 0.36, 0.58, 0.22, 0.44][index % 5] ?? 0.5,
  color: "blue",
}));

grid.directions = Array.from({ length: 16 }, (_, index) =>
  index === 5 ? "left" : index === 11 ? "off" : "right",
);

grid.addEventListener("grid-change", (event) => {
  grid.cells = event.detail.cells;
  grid.directions = event.detail.directions;
}, { signal: cleanup.signal });
`),
  }),
  createExample({
    id: "step-sequencer",
    name: "step-sequencer",
    title: "step",
    description:
      "A piano-roll step sequencer surface with bar-start note accents.",
    react: `
import { useState } from "react";
import { StepSequencer, type StepKey, type StepLoop, type StepNote } from "@patchbay/react";

const initialNotes: StepNote[] = [
  { step: 1, lane: 7, velocity: 1, duration: 1 },
  { step: 6, lane: 2, velocity: 0.8, duration: 1 },
  { step: 11, lane: 2, velocity: 1, duration: 1 },
];

export function StepSequencer() {
  const [auditionKey, setAuditionKey] = useState<StepKey | null>(null);
  const [loop, setLoop] = useState<StepLoop>({ start: 1, end: 16 });
  const [notes, setNotes] = useState(initialNotes);

  return (
    <>
      <StepSequencer
        activeKey="C4"
        bars={4}
        loop={loop}
        notes={notes}
        onKeyPress={setAuditionKey}
        onKeyRelease={() => setAuditionKey(null)}
        onLoopChange={setLoop}
        onNotesChange={setNotes}
      />
      <output>{auditionKey ?? "idle"}</output>
    </>
  );
}
`,
    svelte: `
<script lang="ts">
  import { StepSequencer, type StepKey, type StepLoop, type StepNote } from "@patchbay/svelte";

  let auditionKey: StepKey | null = null;
  let loop: StepLoop = { start: 1, end: 16 };
  let notes: StepNote[] = [
    { step: 1, lane: 7, velocity: 1, duration: 1 },
    { step: 6, lane: 2, velocity: 0.8, duration: 1 },
    { step: 11, lane: 2, velocity: 1, duration: 1 },
  ];
</script>

<StepSequencer
  activeKey="C4"
  bind:loop
  bind:notes
  bars={4}
  onKeyPress={(key) => (auditionKey = key)}
  onKeyRelease={() => (auditionKey = null)}
/>
<output>{auditionKey ?? "idle"}</output>
`,
    html: `
<step-sequencer id="sequence" active-key="C4" bars="4" aria-label="Step sequencer"></step-sequencer>
`,
    script: executableScript(`
const step = root.querySelector("#sequence");
let auditionKey = null;

step.notes = [
  { step: 1, lane: 7, velocity: 1, duration: 1 },
  { step: 6, lane: 2, velocity: 0.8, duration: 1 },
  { step: 11, lane: 2, velocity: 1, duration: 1 },
];
step.loop = { start: 1, end: 16 };

step.addEventListener("step-change", (event) => {
  const { detail } = event;

  if (detail.type === "key") auditionKey = detail.pressed ? detail.key : null;
  if (detail.type === "loop") step.loop = detail.loop;
  if (detail.type === "cell") step.notes = detail.notes;
}, { signal: cleanup.signal });
`),
  }),
  createExample({
    id: "envelope",
    name: "envelope",
    title: "adsr ui",
    description: "An envelope editor surface with draggable-handle styling.",
    react: `
import { useState } from "react";
import { Envelope, type EnvelopeShape } from "@patchbay/react";

export function EnvelopeEditor() {
  const [envelope, setEnvelope] = useState<EnvelopeShape>({
    attack: 0.2,
    decay: 0.3,
    sustain: 0.7,
    release: 0.35,
  });

  return <Envelope envelope={envelope} onEnvelopeChange={setEnvelope} />;
}
`,
    svelte: `
<script lang="ts">
  import { Envelope, type EnvelopeShape } from "@patchbay/svelte";

  let envelope: EnvelopeShape = {
    attack: 0.2,
    decay: 0.3,
    sustain: 0.7,
    release: 0.35,
  };
</script>

<Envelope bind:envelope />
`,
    html: `
<div class="envelope" aria-label="ADSR envelope">
  <svg data-envelope viewBox="0 0 210 96" role="img" aria-label="Envelope curve">
    <path class="envelope__grid" d="M1 24H209M1 48H209M1 72H209M42 1V95M84 1V95M126 1V95M168 1V95" />
    <path class="envelope__curve" data-envelope-curve d="M8 88 L8 12 L58 12 L170 12 C171 52 172 75 194 88" />
    <rect data-envelope-handle="start" x="4" y="84" width="8" height="8" />
    <rect data-envelope-handle="attack" x="4" y="8" width="8" height="8" />
    <circle data-envelope-handle="decay" cx="24" cy="12" r="4" />
    <circle data-envelope-handle="sustain" cx="58" cy="12" r="4" />
    <circle data-envelope-handle="release" cx="178" cy="80" r="4" />
    <rect data-envelope-handle="end" x="190" y="84" width="8" height="8" />
  </svg>
</div>
`,
  }),
  createExample({
    id: "scope",
    name: "scope",
    title: "scope",
    description: "Draw waveform samples from JavaScript into the scope canvas.",
    react: `
import { useEffect, useState } from "react";
import { Scope } from "@patchbay/react";

function makeWave(phase: number) {
  return Array.from({ length: 96 }, (_, index) => {
    return Math.sin(index * 0.16 + phase) * 0.75 + Math.sin(index * 0.41 + phase * 0.7) * 0.2;
  });
}

export function WaveScope() {
  const [samples, setSamples] = useState(() => makeWave(0));

  useEffect(() => {
    let phase = 0;
    const interval = setInterval(() => {
      phase += 0.35;
      setSamples(makeWave(phase));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return <Scope samples={samples} mode="waveform" />;
}
`,
    svelte: `
<script lang="ts">
  import { onMount } from "svelte";
  import { Scope } from "@patchbay/svelte";

  function makeWave(phase: number) {
    return Array.from({ length: 96 }, (_, index) => {
      return Math.sin(index * 0.16 + phase) * 0.75 + Math.sin(index * 0.41 + phase * 0.7) * 0.2;
    });
  }

  let samples = makeWave(0);

  onMount(() => {
    let phase = 0;
    const interval = setInterval(() => {
      phase += 0.35;
      samples = makeWave(phase);
    }, 100);

    return () => clearInterval(interval);
  });
</script>

<Scope {samples} mode="waveform" />
`,
    html: `
<canvas class="scope" width="184" height="98" data-scope aria-label="Scope"></canvas>
`,
    script: executableScript(`
const canvas = root.querySelector("[data-scope]");
const context = canvas.getContext("2d");
let frameId = 0;

function makeWave(time, sampleCount) {
  return Array.from({ length: sampleCount }, (_, index) => {
    return Math.sin(index * 0.16 + time / 260) * 0.75 + Math.sin(index * 0.41 + time / 520) * 0.2;
  });
}

function draw(time) {
  const { width, height } = canvas;
  const samples = makeWave(time, width);

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#161616";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(255, 255, 255, 0.12)";
  context.lineWidth = 1;

  for (let x = 0; x < width; x += 23) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  context.strokeStyle = "#9cd8ca";
  context.lineWidth = 2;
  context.beginPath();

  samples.forEach((sample, index) => {
    const x = (index / Math.max(1, samples.length - 1)) * width;
    const y = height / 2 - sample * (height * 0.38);
    x === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
  });

  context.stroke();
  if (!cleanup.signal.aborted) frameId = requestAnimationFrame(draw);
}

cleanup.signal.addEventListener("abort", () => cancelAnimationFrame(frameId), { once: true });
frameId = requestAnimationFrame(draw);
`),
  }),
  createExample({
    id: "meter",
    name: "meter",
    title: "meter",
    description:
      "Feed the meter a stream of normalized JavaScript signal levels.",
    react: `
import { useEffect, useState } from "react";
import { Meter } from "@patchbay/react";

function readSignalLevel(time: number) {
  const pulse = Math.max(0, Math.sin(time / 260)) * 0.26;
  const sway = Math.sin(time / 680) * 0.13;
  const texture = Math.sin(time / 43) * 0.07 + Math.sin(time / 29) * 0.035;

  return Math.max(0.04, Math.min(0.96, 0.26 + pulse + sway + texture));
}

export function SignalMeter() {
  const [level, setLevel] = useState(0.42);

  useEffect(() => {
    let frameId = 0;

    function frame(time: number) {
      setLevel(readSignalLevel(time));
      frameId = requestAnimationFrame(frame);
    }

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return <Meter level={level} orientation="vertical" />;
}
`,
    svelte: `
<script lang="ts">
  import { onMount } from "svelte";
  import { Meter } from "@patchbay/svelte";

  function readSignalLevel(time: number) {
    const pulse = Math.max(0, Math.sin(time / 260)) * 0.26;
    const sway = Math.sin(time / 680) * 0.13;
    const texture = Math.sin(time / 43) * 0.07 + Math.sin(time / 29) * 0.035;

    return Math.max(0.04, Math.min(0.96, 0.26 + pulse + sway + texture));
  }

  let level = 0.42;

  onMount(() => {
    let frameId = 0;

    function frame(time: number) {
      level = readSignalLevel(time);
      frameId = requestAnimationFrame(frame);
    }

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  });
</script>

<Meter {level} orientation="vertical" />
`,
    html: `
<div class="meter" data-meter aria-label="Signal meter">
  <span class="meter__bar" data-meter-bar aria-hidden="true"></span>
</div>
`,
    script: executableScript(`
const meter = root.querySelector("[data-meter-bar]");
let frameId = 0;

function readSignalLevel(time) {
  const pulse = Math.max(0, Math.sin(time / 260)) * 0.26;
  const sway = Math.sin(time / 680) * 0.13;
  const texture = Math.sin(time / 43) * 0.07 + Math.sin(time / 29) * 0.035;

  return Math.max(0.04, Math.min(0.96, 0.26 + pulse + sway + texture));
}

function setLevel(level) {
  meter.style.setProperty("--meter-value", level.toFixed(3));
}

function frame(time) {
  setLevel(readSignalLevel(time));
  if (!cleanup.signal.aborted) frameId = requestAnimationFrame(frame);
}

cleanup.signal.addEventListener("abort", () => cancelAnimationFrame(frameId), { once: true });
frameId = requestAnimationFrame(frame);
`),
  }),
  createExample({
    id: "gain",
    name: "gain",
    title: "gain",
    description:
      "Use valueDb for the fader and stream normalized level into the signal meter.",
    react: `
import { useEffect, useState } from "react";
import { Gain } from "@patchbay/react";

function readSignalLevel(time: number) {
  const beat = Math.max(0, Math.sin(time / 340 + 0.8)) * 0.22;
  const drift = Math.sin(time / 780) * 0.15;
  const texture = Math.sin(time / 51) * 0.06 + Math.sin(time / 77) * 0.045;

  return Math.max(0.03, Math.min(0.94, 0.3 + beat + drift + texture));
}

export function OutputGain() {
  const [valueDb, setValueDb] = useState(-12);
  const [level, setLevel] = useState(0.38);

  useEffect(() => {
    let frameId = 0;

    function frame(time: number) {
      setLevel(readSignalLevel(time));
      frameId = requestAnimationFrame(frame);
    }

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return <Gain valueDb={valueDb} level={level} onValueDbChange={setValueDb} />;
}
`,
    svelte: `
<script lang="ts">
  import { onMount } from "svelte";
  import { Gain } from "@patchbay/svelte";

  function readSignalLevel(time: number) {
    const beat = Math.max(0, Math.sin(time / 340 + 0.8)) * 0.22;
    const drift = Math.sin(time / 780) * 0.15;
    const texture = Math.sin(time / 51) * 0.06 + Math.sin(time / 77) * 0.045;

    return Math.max(0.03, Math.min(0.94, 0.3 + beat + drift + texture));
  }

  let valueDb = -12;
  let level = 0.38;

  onMount(() => {
    let frameId = 0;

    function frame(time: number) {
      level = readSignalLevel(time);
      frameId = requestAnimationFrame(frame);
    }

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  });
</script>

<Gain bind:valueDb {level} />
`,
    html: `
<label class="gain" data-gain>
  <input type="range" min="-70" max="6" step="0.1" value="-12" aria-label="Gain" />
  <span class="gain__signal" data-gain-signal aria-hidden="true"></span>
  <span class="gain__thumb" aria-hidden="true"></span>
  <span class="gain__readout" data-gain-readout>-12.0 dB</span>
</label>
`,
    script: executableScript(`
const gain = root.querySelector("[data-gain]");
const input = gain.querySelector("input");
const signal = gain.querySelector("[data-gain-signal]");
const readout = gain.querySelector("[data-gain-readout]");
let frameId = 0;
let currentLevel = 0.38;

function readSignalLevel(time) {
  const beat = Math.max(0, Math.sin(time / 340 + 0.8)) * 0.22;
  const drift = Math.sin(time / 780) * 0.15;
  const texture = Math.sin(time / 51) * 0.06 + Math.sin(time / 77) * 0.045;

  return Math.max(0.03, Math.min(0.94, 0.3 + beat + drift + texture));
}

function dbToRatio(db) {
  return Math.max(0, Math.min(1, (db + 70) / 76));
}

function setGain({ valueDb, level }) {
  input.value = String(valueDb);
  gain.style.setProperty("--gain-value", String(dbToRatio(valueDb)));
  signal.style.setProperty("--gain-signal", level.toFixed(3));
  readout.textContent = \`\${valueDb.toFixed(1)} dB\`;
}

input.addEventListener(
  "input",
  () => setGain({ valueDb: Number(input.value), level: currentLevel }),
  { signal: cleanup.signal },
);

function frame(time) {
  currentLevel = readSignalLevel(time);
  setGain({ valueDb: Number(input.value), level: currentLevel });
  if (!cleanup.signal.aborted) frameId = requestAnimationFrame(frame);
}

cleanup.signal.addEventListener("abort", () => cancelAnimationFrame(frameId), { once: true });
frameId = requestAnimationFrame(frame);
`),
  }),
  createExample({
    id: "color-swatches",
    name: "color-swatches",
    title: "colors",
    description: "A compact color swatch grid.",
    react: `
import { useState } from "react";
import { ColorSwatches } from "@patchbay/react";

const swatches = ["#9cd8ca", "#f0b51d", "#aebaff"];

export function ColorPicker() {
  const [value, setValue] = useState(swatches[0]);

  return <ColorSwatches swatches={swatches} value={value} onValueChange={setValue} />;
}
`,
    svelte: `
<script lang="ts">
  import { ColorSwatches } from "@patchbay/svelte";

  const swatches = ["#9cd8ca", "#f0b51d", "#aebaff"];
  let value = swatches[0];
</script>

<ColorSwatches {swatches} bind:value />
`,
    html: `
<div class="color-swatches" aria-label="Color swatches">
  <input type="color" value="#9cd8ca" aria-label="Color one" />
  <input type="color" value="#f0b51d" aria-label="Color two" />
  <input type="color" value="#aebaff" aria-label="Color three" />
</div>
`,
  }),
  createExample({
    id: "macro-rack",
    name: "MacroRack",
    title: "macro rack",
    description: "A bank of dial macros with a compact rack layout.",
    react: `
import { useState } from "react";
import { MacroRack, type MacroRackMacro } from "@patchbay/react";

const initialMacros: MacroRackMacro[] = [
  { id: "filter", label: "Filter", value: 0.72 },
  { id: "space", label: "Space", value: 0.48 },
  { id: "drive", label: "Drive", value: 0.34 },
  { id: "shape", label: "Shape", value: 0.58 },
];

export function MacroControls() {
  const [macros, setMacros] = useState(initialMacros);

  return (
    <MacroRack
      macros={macros}
      columns={4}
      onMacroChange={(id, value) =>
        setMacros((items) => items.map((item) => (item.id === id ? { ...item, value } : item)))
      }
    />
  );
}
`,
    svelte: `
<script lang="ts">
  import { MacroRack, type MacroRackMacro } from "@patchbay/svelte";

  let macros: MacroRackMacro[] = [
    { id: "filter", label: "Filter", value: 0.72 },
    { id: "space", label: "Space", value: 0.48 },
    { id: "drive", label: "Drive", value: 0.34 },
    { id: "shape", label: "Shape", value: 0.58 },
  ];
</script>

<MacroRack bind:macros columns={4} />
`,
    html: `
<div class="macro-rack" role="group" aria-label="Macro rack" style="--macro-rack-columns: 4">
  <label class="field macro-rack__control">
    <span class="field__label">Filter</span>
    <span class="dial" data-dial style="--dial-value: 0.72">
      <input type="range" min="0" max="1" step="0.01" value="0.72" aria-label="Filter" />
    </span>
  </label>
  <label class="field macro-rack__control">
    <span class="field__label">Space</span>
    <span class="dial" data-dial style="--dial-value: 0.48">
      <input type="range" min="0" max="1" step="0.01" value="0.48" aria-label="Space" />
    </span>
  </label>
  <label class="field macro-rack__control">
    <span class="field__label">Drive</span>
    <span class="dial" data-dial style="--dial-value: 0.34">
      <input type="range" min="0" max="1" step="0.01" value="0.34" aria-label="Drive" />
    </span>
  </label>
  <label class="field macro-rack__control">
    <span class="field__label">Shape</span>
    <span class="dial" data-dial style="--dial-value: 0.58">
      <input type="range" min="0" max="1" step="0.01" value="0.58" aria-label="Shape" />
    </span>
  </label>
</div>
`,
  }),
  createExample({
    id: "clip-step-launcher",
    name: "ClipStepLauncher",
    title: "clip step launcher",
    description: "A clip launcher shell around the step sequencer surface.",
    react: `
import { useState } from "react";
import { ClipStepLauncher, type StepLoop, type StepNote } from "@patchbay/react";

const initialNotes: StepNote[] = [
  { step: 1, lane: 7, velocity: 1, duration: 1 },
  { step: 5, lane: 4, velocity: 0.8, duration: 1 },
  { step: 9, lane: 6, velocity: 1, duration: 1 },
  { step: 13, lane: 3, velocity: 0.72, duration: 1 },
];

export function Launcher() {
  const [loop, setLoop] = useState<StepLoop>({ start: 1, end: 16 });
  const [notes, setNotes] = useState(initialNotes);
  const [playing, setPlaying] = useState(false);

  return (
    <ClipStepLauncher
      clipName="Scene 02"
      loop={loop}
      notes={notes}
      playing={playing}
      onLaunch={() => setPlaying(true)}
      onStop={() => setPlaying(false)}
      onLoopChange={setLoop}
      onNotesChange={setNotes}
    />
  );
}
`,
    svelte: `
<script lang="ts">
  import { ClipStepLauncher, type StepLoop, type StepNote } from "@patchbay/svelte";

  let loop: StepLoop = { start: 1, end: 16 };
  let notes: StepNote[] = [
    { step: 1, lane: 7, velocity: 1, duration: 1 },
    { step: 5, lane: 4, velocity: 0.8, duration: 1 },
    { step: 9, lane: 6, velocity: 1, duration: 1 },
    { step: 13, lane: 3, velocity: 0.72, duration: 1 },
  ];
  let playing = false;
</script>

<ClipStepLauncher
  clipName="Scene 02"
  bind:loop
  bind:notes
  {playing}
  onLaunch={() => (playing = true)}
  onStop={() => (playing = false)}
/>
`,
    html: `
<section class="panel clip-step-launcher" aria-label="Step launcher">
  <header class="panel-header">
    <div class="panel-header__main">
      <h3 class="panel-header__title">Step launcher</h3>
      <p class="panel-header__subtitle">Scene 02</p>
    </div>
    <div class="panel-header__actions">
      <span class="status-indicator" data-tone="idle">
        <span class="status-indicator__dot" aria-hidden="true"></span>
        <span class="status-indicator__label">Clip</span>
        <strong class="status-indicator__value">Ready</strong>
      </span>
    </div>
  </header>
  <div class="clip-step-launcher__transport">
    <button class="text-button clip-step-launcher__launch" data-appearance="primary" type="button">
      <span class="text-button__label">Launch</span>
    </button>
    <button class="text-button clip-step-launcher__stop" data-appearance="subtle" type="button">
      <span class="text-button__label">Stop</span>
    </button>
  </div>
  <step-sequencer id="clip-step-launcher-surface" class="clip-step-launcher__steps"></step-sequencer>
</section>
`,
    script: executableScript(`
const step = root.querySelector("#clip-step-launcher-surface");

step.notes = [
  { step: 1, lane: 7, velocity: 1, duration: 1 },
  { step: 5, lane: 4, velocity: 0.8, duration: 1 },
  { step: 9, lane: 6, velocity: 1, duration: 1 },
  { step: 13, lane: 3, velocity: 0.72, duration: 1 },
];
step.loop = { start: 1, end: 16 };
step.addEventListener("step-change", (event) => {
  step.loop = event.detail.loop;
  step.notes = event.detail.notes;
}, { signal: cleanup.signal });
`),
  }),
] as const satisfies readonly ComponentExample[];

export const pageMarkdown = `# patchbay ui

Native HTML controls for audio-extension UIs. Use them from vanilla JavaScript, React, or Svelte.

## Get Started

${variantsMarkdown(getStartedVariants)}

## Components

${componentExamples.map((example) => componentMarkdown(example)).join("\n")}
`;
