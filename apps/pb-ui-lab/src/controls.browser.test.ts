import { beforeEach, describe, expect, test } from "vitest";
import { renderPatchbayLab } from "./main";

function pointerEvent(type: string, init: PointerEventInit): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    pointerId: 1,
    pointerType: "mouse",
    ...init,
  });
}

function getAdsrHandle(svg: SVGSVGElement, name: string): SVGGraphicsElement {
  const handle = svg.querySelector<SVGGraphicsElement>(
    `[data-envelope-handle="${name}"]`,
  );
  expect(handle).not.toBeNull();
  return handle!;
}

function handleCenter(handle: SVGGraphicsElement): { x: number; y: number } {
  if (handle instanceof SVGCircleElement) {
    return {
      x: Number(handle.getAttribute("cx")),
      y: Number(handle.getAttribute("cy")),
    };
  }

  return {
    x:
      Number(handle.getAttribute("x")) +
      Number(handle.getAttribute("width") ?? 8) / 2,
    y:
      Number(handle.getAttribute("y")) +
      Number(handle.getAttribute("height") ?? 8) / 2,
  };
}

function clientPoint(
  svg: SVGSVGElement,
  point: { x: number; y: number },
): { clientX: number; clientY: number } {
  const rect = svg.getBoundingClientRect();
  return {
    clientX: rect.left + (point.x / 210) * rect.width,
    clientY: rect.top + (point.y / 96) * rect.height,
  };
}

function dragHandleTo(
  svg: SVGSVGElement,
  handle: SVGGraphicsElement,
  point: { x: number; y: number },
): void {
  const start = clientPoint(svg, handleCenter(handle));
  const target = clientPoint(svg, point);

  handle.dispatchEvent(pointerEvent("pointerdown", start));
  handle.dispatchEvent(pointerEvent("pointermove", target));
  handle.dispatchEvent(pointerEvent("pointerup", target));
}

function dragHandleAcrossViewport(
  svg: SVGSVGElement,
  handle: SVGGraphicsElement,
  point: { x: number; y: number },
): void {
  const start = clientPoint(svg, handleCenter(handle));
  const target = clientPoint(svg, point);

  handle.dispatchEvent(pointerEvent("pointerdown", start));
  window.dispatchEvent(pointerEvent("pointermove", target));
  window.dispatchEvent(pointerEvent("pointerup", target));
}

describe("patchbay ui browser interactions", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    const app = document.querySelector<HTMLElement>("#app");
    expect(app).not.toBeNull();
    renderPatchbayLab(app!);
  });

  test("lab chrome and token swatches inherit the exported patchbay theme", () => {
    const app = document.querySelector<HTMLElement>("#app");
    const status = document.querySelector<HTMLElement>(".component-status");
    const swatch = document.querySelector<HTMLElement>(
      '[data-theme-token="patchbay.modulation"] .lab-token-swatch',
    );

    expect(app).not.toBeNull();
    expect(status).not.toBeNull();
    expect(swatch).not.toBeNull();
    expect(app!.style.getPropertyValue("--modulation-color")).toBe("#9cd8ca");
    expect(swatch!.style.getPropertyValue("--lab-token-color")).toBe(
      "var(--modulation-color)",
    );
    expect(getComputedStyle(status!).backgroundColor).toBe(
      "rgb(156, 216, 202)",
    );
  });

  test("dial values clamp to the supported sweep", () => {
    const dial = document.querySelector<HTMLElement>("[data-dial]");
    const input = dial?.querySelector<HTMLInputElement>('input[type="range"]');

    expect(dial).not.toBeNull();
    expect(input).not.toBeNull();

    input!.value = "999";
    input!.dispatchEvent(new Event("input", { bubbles: true }));
    expect(dial!.style.getPropertyValue("--dial-value")).toBe("1");

    input!.value = "-999";
    input!.dispatchEvent(new Event("input", { bubbles: true }));
    expect(dial!.style.getPropertyValue("--dial-value")).toBe("0");
  });

  test("ADSR attack handle cannot cross the decay handle when dragged far right", () => {
    const svg = document.querySelector<SVGSVGElement>("[data-envelope]");
    expect(svg).not.toBeNull();

    const attack = getAdsrHandle(svg!, "attack");
    const decay = getAdsrHandle(svg!, "decay");

    dragHandleTo(svg!, attack, { x: 240, y: 8 });

    expect(handleCenter(attack).x).toBeLessThanOrEqual(handleCenter(decay).x);
  });

  test("ADSR handles keep dragging after the pointer leaves the small handle", () => {
    const svg = document.querySelector<SVGSVGElement>("[data-envelope]");
    expect(svg).not.toBeNull();

    const sustain = getAdsrHandle(svg!, "sustain");

    dragHandleAcrossViewport(svg!, sustain, { x: 76, y: 54 });

    expect(handleCenter(sustain).x).toBeCloseTo(76, 0);
    expect(handleCenter(sustain).y).toBeCloseTo(54, 0);
  });

  test("ADSR start and end handles stay pinned to the bottom baseline", () => {
    const svg = document.querySelector<SVGSVGElement>("[data-envelope]");
    expect(svg).not.toBeNull();

    const start = getAdsrHandle(svg!, "start");
    const end = getAdsrHandle(svg!, "end");

    dragHandleTo(svg!, start, { x: 80, y: 4 });
    dragHandleTo(svg!, end, { x: 120, y: 4 });

    expect(handleCenter(start).y).toBe(88);
    expect(handleCenter(end).y).toBe(88);
  });

  test("ADSR decay and sustain handles cannot cross adjacent phase handles", () => {
    const svg = document.querySelector<SVGSVGElement>("[data-envelope]");
    expect(svg).not.toBeNull();

    const attack = getAdsrHandle(svg!, "attack");
    const decay = getAdsrHandle(svg!, "decay");
    const sustain = getAdsrHandle(svg!, "sustain");

    dragHandleTo(svg!, decay, { x: -40, y: 12 });
    expect(handleCenter(decay).x).toBeGreaterThanOrEqual(
      handleCenter(attack).x,
    );

    dragHandleTo(svg!, decay, { x: 240, y: 12 });
    expect(handleCenter(decay).x).toBeLessThanOrEqual(handleCenter(sustain).x);

    dragHandleTo(svg!, sustain, { x: -40, y: 12 });
    expect(handleCenter(sustain).x).toBeGreaterThanOrEqual(
      handleCenter(decay).x,
    );

    dragHandleTo(svg!, sustain, { x: 240, y: 12 });
    expect(handleCenter(sustain).x).toBeLessThanOrEqual(170);
  });

  test("ADSR release handle stays inside the release segment and above the baseline", () => {
    const svg = document.querySelector<SVGSVGElement>("[data-envelope]");
    expect(svg).not.toBeNull();

    const sustain = getAdsrHandle(svg!, "sustain");
    const release = getAdsrHandle(svg!, "release");
    const end = getAdsrHandle(svg!, "end");

    dragHandleTo(svg!, release, { x: -40, y: 0 });
    expect(handleCenter(release).x).toBeGreaterThanOrEqual(170);
    expect(handleCenter(release).y).toBeGreaterThanOrEqual(
      handleCenter(sustain).y,
    );

    dragHandleTo(svg!, release, { x: 240, y: 120 });
    expect(handleCenter(release).x).toBeLessThanOrEqual(handleCenter(end).x);
    expect(handleCenter(release).y).toBeLessThanOrEqual(handleCenter(end).y);
  });

  test("step cells toggle on click", () => {
    let cell = document.querySelector<HTMLButtonElement>(
      '[id="step-sequencer"] .step-sequencer__roll button[aria-label="Step 1, lane 1"]',
    );
    expect(cell).not.toBeNull();
    expect(cell!.classList.contains("is-active")).toBe(false);

    cell!.click();

    cell = document.querySelector<HTMLButtonElement>(
      '[id="step-sequencer"] .step-sequencer__roll button[aria-label="Step 1, lane 1"]',
    );
    expect(cell!.classList.contains("is-active")).toBe(true);
  });

  test("gain readout and signal state update", () => {
    const gain = document.querySelector<HTMLElement>("[data-gain]");
    const input = gain?.querySelector<HTMLInputElement>('input[type="range"]');
    const signal = gain?.querySelector<HTMLElement>("[data-gain-signal]");
    const readout = gain?.querySelector<HTMLElement>("[data-gain-readout]");

    expect(gain).not.toBeNull();
    expect(input).not.toBeNull();
    expect(signal).not.toBeNull();
    expect(readout).not.toBeNull();

    expect(readout!.textContent).toBe("-12.0 dB");
    expect(signal!.style.getPropertyValue("--gain-signal")).not.toBe("");

    input!.value = "-6.5";
    input!.dispatchEvent(new Event("input", { bubbles: true }));

    expect(gain!.style.getPropertyValue("--gain-value")).not.toBe("");
    expect(readout!.textContent).toBe("-6.5 dB");
  });

  test("custom menu listbox commits selections and emits changes", () => {
    const menu = document.querySelector<HTMLElement>("#menu [data-menu]");
    const button = menu?.querySelector<HTMLButtonElement>(".menu__button");
    const list = menu?.querySelector<HTMLElement>(".menu__list");
    const value = menu?.querySelector<HTMLElement>(".menu__value");
    const bright = menu?.querySelector<HTMLButtonElement>(
      '.menu__option[data-value="bright"]',
    );
    const changes: unknown[] = [];

    expect(menu).not.toBeNull();
    expect(button).not.toBeNull();
    expect(list).not.toBeNull();
    expect(value).not.toBeNull();
    expect(bright).not.toBeNull();

    menu!.addEventListener("menu-change", (event) => {
      changes.push((event as CustomEvent).detail);
    });

    expect(menu!.dataset.value).toBe("classic");
    expect(value!.textContent).toBe("Classic");
    expect(list!.hidden).toBe(false);

    bright!.click();

    expect(menu!.dataset.value).toBe("bright");
    expect(value!.textContent).toBe("Bright");
    expect(list!.hidden).toBe(true);
    expect(changes).toContainEqual({
      label: "Bright",
      source: "user",
      value: "bright",
    });

    button!.click();
    button!.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" }),
    );
    button!.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
    );

    expect(menu!.dataset.value).toBe("muted");
    expect(value!.textContent).toBe("Muted");
  });
});
