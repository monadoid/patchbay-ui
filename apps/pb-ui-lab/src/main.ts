import {
  createTheme,
  defineElements,
  initUi,
  tailwindPreset,
  themeStyle,
  type ThemeOverrides,
} from "@patchbay/ui";
import "@patchbay/ui/styles.css";
import "./styles.css";

defineElements();

type ComponentPreview = {
  name: string;
  status: string;
  html: string;
};

const labThemeOverrides = {
  "--control-bg": "#313330",
  "--control-active-bg": "#9cd8ca",
  "--control-border": "#1b1d1a",
  "--focus-border": "#9cd8ca",
  "--slider-color": "#181a18",
  "--modulation-color": "#9cd8ca",
  "--indicator-color": "#ece7d8",
  "--indicator-active-color": "#9cd8ca",
  "--indicator-border-color": "#4b5550",
  "--text-color": "#f4efe1",
  "--muted-text-color": "#bcb6a7",
  "--panel-color": "#3b3b3b",
  "--gridline-color": "rgba(236, 231, 216, 0.14)",
  "--control-radius": "4px",
} satisfies ThemeOverrides;
const labTheme = createTheme(labThemeOverrides);
const labThemeStyle = themeStyle(labTheme);
const tailwindColorTokens = tailwindPreset.theme.extend.colors.patchbay;
const labThemeSwatches = [
  ["patchbay.panel", tailwindColorTokens.panel],
  ["patchbay.bg", tailwindColorTokens.bg],
  ["patchbay.slider", tailwindColorTokens.slider],
  ["patchbay.modulation", tailwindColorTokens.modulation],
  ["patchbay.indicator", tailwindColorTokens.indicator],
  ["patchbay.focus", tailwindColorTokens.focus],
] as const;
const labColorValues = [
  labTheme["--modulation-color"],
  labTheme["--indicator-color"],
  labTheme["--slider-color"],
  "#f0c14f",
  "#2fa66f",
  "#d95d5d",
] as const;
const demoGridYByCell = new Map([
  [1, 0.72],
  [5, 0.52],
  [9, 0.36],
  [10, 0.32],
  [14, 0.16],
]);
const demoGridCells = Array.from({ length: 16 }, (_, index) => ({
  active: [1, 5, 9, 10, 14, 18, 22, 27].includes(index),
  color: "blue",
  y: demoGridYByCell.get(index) ?? 0.5,
}));
const demoGridDirections = Array.from({ length: 16 }, (_, index) =>
  index === 5 ? "left" : index === 11 ? "off" : "right",
);
const demoStepNotes = [
  { step: 1, lane: 8, velocity: 1, duration: 1 },
  { step: 2, lane: 6, velocity: 1, duration: 1 },
  { step: 3, lane: 4, velocity: 1, duration: 1 },
  { step: 4, lane: 2, velocity: 1, duration: 1 },
  { step: 5, lane: 5, velocity: 1, duration: 1 },
  { step: 6, lane: 3, velocity: 1, duration: 1 },
  { step: 7, lane: 7, velocity: 1, duration: 1 },
  { step: 8, lane: 2, velocity: 1, duration: 1 },
  { step: 9, lane: 5, velocity: 1, duration: 1 },
  { step: 10, lane: 4, velocity: 1, duration: 1 },
  { step: 11, lane: 3, velocity: 1, duration: 1 },
  { step: 12, lane: 6, velocity: 1, duration: 1 },
  { step: 13, lane: 7, velocity: 1, duration: 1 },
  { step: 14, lane: 5, velocity: 1, duration: 1 },
  { step: 15, lane: 3, velocity: 1, duration: 1 },
  { step: 16, lane: 6, velocity: 1, duration: 1 },
];

const components: ComponentPreview[] = [
  {
    name: "slider",
    status: "interactive",
    html: `
      <div class="demo-group demo-group--sliders">
        <label class="field">
          <span class="field__label">A</span>
          <span class="slider" data-slider data-modulation="0.78">
            <input type="range" min="0" max="1" step="0.01" value="0.42" aria-label="Slider A" />
          </span>
        </label>
        <label class="field">
          <span class="field__label">B</span>
          <span class="slider" data-slider data-modulation="0.32">
            <input type="range" min="0" max="1" step="0.01" value="0.68" aria-label="Slider B" />
          </span>
        </label>
        <label class="field field--wide">
          <span class="field__label">Horizontal</span>
          <span class="slider" data-slider data-orientation="horizontal" data-modulation="0.6" style="--slider-length: 180px">
            <input type="range" min="0" max="1" step="0.01" value="0.35" aria-label="Horizontal slider" />
          </span>
        </label>
      </div>
    `,
  },
  {
    name: "dial",
    status: "prototype",
    html: `
      <label class="field">
        <span class="field__label">Macro</span>
        <span class="dial" data-dial>
          <input type="range" min="0" max="1" step="0.01" value="0.62" aria-label="Dial macro" />
        </span>
      </label>
    `,
  },
  {
    name: "toggle",
    status: "prototype",
    html: `
      <label class="toggle">
        <input type="checkbox" checked aria-label="Toggle" />
        <span aria-hidden="true"></span>
      </label>
    `,
  },
  {
    name: "button",
    status: "prototype",
    html: `
      <button class="button" type="button" aria-label="Momentary button"></button>
    `,
  },
  {
    name: "text-button",
    status: "prototype",
    html: `
      <button class="text-button" data-appearance="primary" type="button">
        <span class="text-button__icon" aria-hidden="true">▶</span>
        <span class="text-button__label">Trigger</span>
      </button>
    `,
  },
  {
    name: "label",
    status: "candidate",
    html: `
      <p class="label">Parameter note</p>
    `,
  },
  {
    name: "tabs",
    status: "prototype",
    html: `
      <div class="tabs" role="tablist" aria-label="Mode">
        <button class="tab is-active" type="button" role="tab" aria-selected="true">One</button>
        <button class="tab" type="button" role="tab" aria-selected="false">Two</button>
        <button class="tab" type="button" role="tab" aria-selected="false">Three</button>
      </div>
    `,
  },
  {
    name: "menu",
    status: "prototype",
    html: `
      <div class="menu" data-menu data-open="true" data-value="classic">
        <button class="menu__button" type="button" aria-haspopup="listbox" aria-expanded="true">
          <span class="menu__value">Classic</span>
          <span class="menu__chevron" aria-hidden="true"></span>
        </button>
        <div class="menu__list" role="listbox" aria-label="Menu">
          <button class="menu__option is-selected" data-value="classic" type="button" role="option" aria-selected="true">Classic</button>
          <button class="menu__option is-active" data-value="bright" type="button" role="option" aria-selected="false">Bright</button>
          <button class="menu__option" data-value="muted" type="button" role="option" aria-selected="false">Muted</button>
        </div>
      </div>
    `,
  },
  {
    name: "arrows",
    status: "candidate",
    html: `
      <div class="arrows" role="group" aria-label="Arrows">
        <button type="button" aria-label="Left"></button>
        <button type="button" aria-label="Right"></button>
      </div>
    `,
  },
  {
    name: "drop",
    status: "candidate",
    html: `
      <label class="drop">
        <input type="file" aria-label="Drop file" />
        <span aria-hidden="true"></span>
      </label>
    `,
  },
  {
    name: "line",
    status: "candidate",
    html: `
      <div class="line-set" aria-label="Lines">
        <span class="line"></span>
        <span class="line line--vertical"></span>
      </div>
    `,
  },
  {
    name: "number-box",
    status: "prototype",
    html: `
      <input class="number-box" type="number" min="0" max="127" value="64" aria-label="Number box" />
    `,
  },
  {
    name: "grid",
    status: "prototype",
    html: `
      <sequencer-grid
        aria-label="Grid"
        cells='${JSON.stringify(demoGridCells)}'
        directions='${JSON.stringify(demoGridDirections)}'
      ></sequencer-grid>
    `,
  },
  {
    name: "step-sequencer",
    status: "prototype",
    html: `
      <step-sequencer
        active-key="C4"
        aria-label="Step sequencer"
        bars="4"
        loop='${JSON.stringify({ start: 1, end: 16 })}'
        notes='${JSON.stringify(demoStepNotes)}'
      ></step-sequencer>
    `,
  },
  {
    name: "envelope",
    status: "prototype",
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
  },
  {
    name: "scope",
    status: "prototype",
    html: `
      <canvas class="scope" width="184" height="98" data-scope aria-label="Scope"></canvas>
    `,
  },
  {
    name: "meter",
    status: "prototype",
    html: `
      <div class="meter" data-meter aria-label="Signal meter">
        <span class="meter__bar" data-meter-bar style="--meter-value: 0" aria-hidden="true"></span>
      </div>
    `,
  },
  {
    name: "gain",
    status: "prototype",
    html: `
      <label class="gain" data-gain>
        <input type="range" min="-70" max="6" step="0.1" value="-12" aria-label="Gain" />
        <span class="gain__signal" data-gain-signal style="--gain-signal: 0" aria-hidden="true"></span>
        <span class="gain__thumb" aria-hidden="true"></span>
        <span class="gain__readout" data-gain-readout>-12.0 dB</span>
      </label>
    `,
  },
  {
    name: "color-swatches",
    status: "prototype",
    html: `
      <div class="color-swatches" aria-label="Color swatches">
        ${labColorValues
          .map(
            (color) =>
              `<input type="color" value="${color}" aria-label="Color ${color}" />`,
          )
          .join("")}
      </div>
    `,
  },
];

export function renderPatchbayLab(app: HTMLElement): void {
  app.style.cssText = labThemeStyle;
  app.innerHTML = `
    <main class="lab-shell">
      <header class="lab-header">
        <p class="lab-kicker">patchbay ui extraction lab</p>
        <h1>Component comparison batch</h1>
        ${renderThemeSwatches()}
      </header>

      <div class="comparison-list">
        ${components.map(renderComponent).join("")}
      </div>
    </main>
  `;

  initUi(app);
  initDials(app);
  initTabs(app);
  initMomentaryButtons(app);
  initGains(app);
  initSignalDisplays(app);
}

function renderThemeSwatches(): string {
  return `
    <div class="lab-token-rail" aria-label="patchbay ui theme tokens">
      ${labThemeSwatches
        .map(
          ([label, color]) => `
            <span class="lab-token-chip" data-theme-token="${label}">
              <span class="lab-token-swatch" style="--lab-token-color: ${color}" aria-hidden="true"></span>
              <span>${label}</span>
            </span>
          `,
        )
        .join("")}
      <span class="lab-token-chip" data-theme-token="patchbay.radius">
        <span class="lab-token-radius" aria-hidden="true"></span>
        <span>patchbay.radius</span>
      </span>
    </div>
  `;
}

function renderComponent(component: ComponentPreview): string {
  return `
    <section class="comparison-section" id="${safeComponentName(component.name)}">
      <div class="component-copy">
        <p class="component-name">${component.name}</p>
        <span class="component-status">${component.status}</span>
      </div>
      <div class="component-demo-panel">
        ${component.html}
      </div>
    </section>
  `;
}

function safeComponentName(component: string): string {
  return component.replace(/[^a-zA-Z0-9_.~-]+/g, "-");
}

function initDials(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[data-dial]").forEach((dial) => {
    const input = dial.querySelector<HTMLInputElement>('input[type="range"]');
    if (!input) {
      return;
    }

    const sync = () => {
      const min = Number(input.min || 0);
      const max = Number(input.max || 1);
      const value = Number(input.value || 0);
      const ratio = Math.min(1, Math.max(0, (value - min) / (max - min || 1)));
      dial.style.setProperty("--dial-value", String(ratio));
    };

    input.addEventListener("input", sync);
    sync();
  });
}

function initTabs(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(".tabs").forEach((tablist) => {
    tablist.querySelectorAll<HTMLButtonElement>(".tab").forEach((button) => {
      button.addEventListener("click", () => {
        tablist
          .querySelectorAll<HTMLButtonElement>(".tab")
          .forEach((tab) => {
            const active = tab === button;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", String(active));
          });
      });
    });
  });
}

function initMomentaryButtons(root: ParentNode = document): void {
  root.querySelectorAll<HTMLButtonElement>(".button").forEach((button) => {
    button.addEventListener("pointerdown", () =>
      button.classList.add("is-active"),
    );
    button.addEventListener("pointerup", () =>
      button.classList.remove("is-active"),
    );
    button.addEventListener("pointerleave", () =>
      button.classList.remove("is-active"),
    );
  });
}

function initGains(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[data-gain]").forEach((gain) => {
    const input = gain.querySelector<HTMLInputElement>('input[type="range"]');
    if (!input) {
      return;
    }
    const sync = () => {
      const min = Number(input.min || -70);
      const max = Number(input.max || 6);
      const value = Number(input.value || min);
      const ratio = Math.min(1, Math.max(0, (value - min) / (max - min || 1)));
      gain.style.setProperty("--gain-value", String(ratio));
      const readout = gain.querySelector<HTMLElement>("[data-gain-readout]");
      if (readout) {
        readout.textContent = `${value.toFixed(1)} dB`;
      }
    };
    input.addEventListener("input", sync);
    sync();
  });
}

function initSignalDisplays(root: ParentNode = document): void {
  const meters = Array.from(
    root.querySelectorAll<HTMLElement>("[data-meter-bar]"),
  );
  const gainSignals = Array.from(
    root.querySelectorAll<HTMLElement>("[data-gain-signal]"),
  );
  const scopes = Array.from(
    root.querySelectorAll<HTMLCanvasElement>("[data-scope]"),
  )
    .map((canvas) => ({ canvas, context: canvas.getContext("2d") }))
    .filter(
      (
        scope,
      ): scope is {
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
      } => scope.context !== null,
    );

  if (meters.length === 0 && gainSignals.length === 0 && scopes.length === 0) {
    return;
  }

  const startTime = performance.now();

  const render = (now: number) => {
    const attachedMeters = meters.filter((meter) => meter.isConnected);
    const attachedGainSignals = gainSignals.filter(
      (signal) => signal.isConnected,
    );
    const attachedScopes = scopes.filter(({ canvas }) => canvas.isConnected);

    if (
      attachedMeters.length === 0 &&
      attachedGainSignals.length === 0 &&
      attachedScopes.length === 0
    ) {
      return;
    }

    const seconds = (now - startTime) / 1000;
    const level = simulatedSignalLevel(seconds);

    attachedMeters.forEach((meter) => {
      meter.style.setProperty("--meter-value", level.toFixed(3));
    });
    attachedGainSignals.forEach((signal) => {
      signal.style.setProperty("--gain-signal", level.toFixed(3));
    });
    attachedScopes.forEach(({ canvas, context }) => {
      drawScopeSignal(canvas, context, seconds, level);
    });

    requestAnimationFrame(render);
  };

  render(startTime);
}

function simulatedSignalLevel(seconds: number): number {
  const slow = Math.sin(seconds * Math.PI * 1.35) * 0.5 + 0.5;
  const fast = Math.sin(seconds * Math.PI * 6.2) * 0.5 + 0.5;
  return Math.min(0.95, Math.max(0.08, 0.12 + slow * 0.56 + fast * 0.18));
}

function drawScopeSignal(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  seconds: number,
  level: number,
): void {
  const theme = getComputedStyle(canvas);

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = themeColor(theme, "--panel-color", "#161616");
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = themeColor(
    theme,
    "--gridline-color",
    "rgba(255, 255, 255, 0.12)",
  );
  context.lineWidth = 1;
  for (let y = 16; y < canvas.height; y += 16) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
  for (let x = 24; x < canvas.width; x += 24) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }

  const phase = seconds * Math.PI * 2.8;
  const amplitude = 10 + level * 24;
  context.strokeStyle = themeColor(theme, "--modulation-color", "#6dd7ff");
  context.lineWidth = 2;
  context.beginPath();
  for (let x = 0; x < canvas.width; x += 1) {
    const normalized = x / canvas.width;
    const y =
      canvas.height / 2 +
      Math.sin(normalized * Math.PI * 6 + phase) * amplitude +
      Math.sin(normalized * Math.PI * 17 + phase * 0.37) * 5;
    if (x === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.stroke();
}

function themeColor(
  theme: CSSStyleDeclaration,
  variable: string,
  fallback: string,
): string {
  return theme.getPropertyValue(variable).trim() || fallback;
}

const app = document.querySelector<HTMLElement>("#app");

if (app) {
  renderPatchbayLab(app);
}
