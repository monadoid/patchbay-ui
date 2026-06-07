import { beforeEach, describe, expect, test } from "vitest";
import { renderPatchbayLab } from "./main";

function renderStepEditor(): HTMLElement {
  document.body.innerHTML = '<div id="app"></div>';
  const app = document.querySelector<HTMLElement>("#app");
  expect(app).not.toBeNull();

  renderPatchbayLab(app!);

  const step = document.querySelector<HTMLElement>('[id="step-sequencer"] step-sequencer');
  expect(step).not.toBeNull();
  return step!;
}

function getStepLabel(step: HTMLElement, index: number): HTMLElement {
  const label = step.querySelectorAll<HTMLElement>(".step-sequencer__labels span")[
    index
  ];
  expect(label).not.toBeUndefined();
  return label!;
}

function getStepKey(step: HTMLElement, index: number): HTMLElement {
  const key = step.querySelector<HTMLElement>(`[data-step-key="${index}"]`);
  expect(key).not.toBeNull();
  return key!;
}

function getLoopHandle(
  step: HTMLElement,
  edge: "start" | "end",
): HTMLButtonElement {
  const handle = step.querySelector<HTMLButtonElement>(
    `[data-step-loop-handle="${edge}"]`,
  );
  expect(handle).not.toBeNull();
  return handle!;
}

function getLoopRange(step: HTMLElement): HTMLElement {
  const range = step.querySelector<HTMLElement>("[data-step-loop-range]");
  expect(range).not.toBeNull();
  return range!;
}

function getStepCell(
  step: HTMLElement,
  stepIndex: number,
  lane: number,
): HTMLButtonElement {
  const cell = step.querySelector<HTMLButtonElement>(
    `.step-sequencer__roll button[aria-label="Step ${stepIndex}, lane ${lane}"]`,
  );
  expect(cell).not.toBeNull();
  return cell!;
}

describe("step-sequencer editor interactions", () => {
  let step: HTMLElement;

  beforeEach(() => {
    step = renderStepEditor();
  });

  test("key presses are momentary and emit press and release changes", () => {
    let key = getStepKey(step, 4);
    const changes: unknown[] = [];
    step.addEventListener("step-change", (event) =>
      changes.push((event as CustomEvent).detail),
    );

    key.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        pointerId: 1,
      }),
    );

    key = getStepKey(step, 4);
    expect(step.dataset.activeKey).toBe("C4");
    expect(step.dataset.activeKeyIndex).toBe("1");
    expect(step.dataset.pressedKey).toBe("D#4");
    expect(step.dataset.pressedKeyIndex).toBe("4");
    expect(getStepLabel(step, 0).textContent).toBe("D#4");
    expect(key.classList.contains("is-active")).toBe(true);
    expect(key.getAttribute("aria-pressed")).toBe("true");
    expect(getComputedStyle(key).cursor).toBe("pointer");
    expect(step.getAttribute("aria-label")).toContain("key D#4");
    expect(changes).toContainEqual(
      expect.objectContaining({
        type: "key",
        key: "D#4",
        phase: "press",
        pressed: true,
      }),
    );

    window.dispatchEvent(
      new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }),
    );

    key = getStepKey(step, 4);
    expect(step.dataset.activeKey).toBe("C4");
    expect(step.dataset.pressedKey).toBeUndefined();
    expect(getStepLabel(step, 0).textContent).toBe("C4");
    expect(key.classList.contains("is-active")).toBe(false);
    expect(key.getAttribute("aria-pressed")).toBe("false");
    expect(changes).toContainEqual(
      expect.objectContaining({
        type: "key",
        key: "D#4",
        phase: "release",
        pressed: false,
      }),
    );
  });

  test("black piano keys render as full-width rows", () => {
    const whiteKey = getStepKey(step, 1);
    const blackKey = getStepKey(step, 2);
    const whiteRect = whiteKey.getBoundingClientRect();
    const blackRect = blackKey.getBoundingClientRect();
    const blackStyle = getComputedStyle(blackKey);
    const blackAfterStyle = getComputedStyle(blackKey, "::after");

    expect(blackKey.dataset.stepKeyTone).toBe("black");
    expect(blackRect.width).toBeCloseTo(whiteRect.width, 1);
    expect(blackStyle.backgroundColor).toBe("rgb(16, 16, 16)");
    expect(blackAfterStyle.content).toBe("none");
  });

  test("loop range sits above the roll without adding a top piano key", () => {
    const ruler = step.querySelector<HTMLElement>(".step-sequencer__loop-ruler");
    const keys = step.querySelector<HTMLElement>(".step-sequencer__keys");
    const roll = step.querySelector<HTMLElement>(".step-sequencer__roll");
    const labels = step.querySelectorAll<HTMLElement>(".step-sequencer__labels span");
    const range = getLoopRange(step);
    const start = getLoopHandle(step, "start");
    const end = getLoopHandle(step, "end");
    const startArrow = start.querySelector<HTMLElement>(
      "[data-step-loop-arrow]",
    );
    const endArrow = end.querySelector<HTMLElement>(
      "[data-step-loop-arrow]",
    );

    expect(ruler).not.toBeNull();
    expect(keys).not.toBeNull();
    expect(roll).not.toBeNull();
    expect(labels).toHaveLength(1);
    expect(start.textContent).toBe("1");
    expect(end.textContent).toBe("16");
    expect(startArrow?.dataset.stepLoopArrow).toBe("right");
    expect(endArrow?.dataset.stepLoopArrow).toBe("left");
    expect(startArrow?.getAttribute("aria-hidden")).toBe("true");
    expect(endArrow?.getAttribute("aria-hidden")).toBe("true");
    expect(range.dataset.stepLoopStart).toBe("1");
    expect(range.dataset.stepLoopEnd).toBe("16");
    expect(range.dataset.stepLoopLength).toBe("16");

    const rulerRect = ruler!.getBoundingClientRect();
    const keysRect = keys!.getBoundingClientRect();
    const rollRect = roll!.getBoundingClientRect();
    const firstKeyRect = getStepKey(step, 1).getBoundingClientRect();

    expect(rulerRect.bottom).toBeLessThanOrEqual(rollRect.top + 0.5);
    expect(keysRect.top).toBeGreaterThanOrEqual(rollRect.top - 0.5);
    expect(firstKeyRect.top).toBeGreaterThanOrEqual(rulerRect.bottom - 0.5);
  });

  test("loop handles trim the selected range", () => {
    let range = getLoopRange(step);
    const ruler = step.querySelector<HTMLElement>(".step-sequencer__loop-ruler");
    const end = getLoopHandle(step, "end");
    const changes: unknown[] = [];
    expect(ruler).not.toBeNull();
    step.addEventListener("step-change", (event) =>
      changes.push((event as CustomEvent).detail),
    );

    const rulerRect = ruler!.getBoundingClientRect();
    const stepEightX = rulerRect.left + rulerRect.width * ((8 - 0.5) / 16);

    end.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        clientX: rulerRect.right - 1,
        pointerId: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        clientX: stepEightX,
        pointerId: 1,
      }),
    );
    window.dispatchEvent(
      new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }),
    );

    range = getLoopRange(step);
    expect(step.dataset.loopStart).toBe("1");
    expect(step.dataset.loopEnd).toBe("8");
    expect(step.dataset.loopLength).toBe("8");
    expect(range.dataset.stepLoopStart).toBe("1");
    expect(range.dataset.stepLoopEnd).toBe("8");
    expect(getLoopHandle(step, "end").textContent).toBe("8");
    expect(changes).toContainEqual(
      expect.objectContaining({ type: "loop", loop: { start: 1, end: 8 } }),
    );

    const start = getLoopHandle(step, "start");
    const updatedRuler = step.querySelector<HTMLElement>(
      ".step-sequencer__loop-ruler",
    );
    expect(updatedRuler).not.toBeNull();
    const updatedRulerRect = updatedRuler!.getBoundingClientRect();
    const stepThreeX =
      updatedRulerRect.left + updatedRulerRect.width * ((3 - 0.5) / 16);

    start.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        clientX: updatedRulerRect.left + 1,
        pointerId: 2,
      }),
    );
    window.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        clientX: stepThreeX,
        pointerId: 2,
      }),
    );
    window.dispatchEvent(
      new PointerEvent("pointerup", { bubbles: true, pointerId: 2 }),
    );

    range = getLoopRange(step);
    expect(step.dataset.loopStart).toBe("3");
    expect(step.dataset.loopEnd).toBe("8");
    expect(step.dataset.loopLength).toBe("6");
    expect(range.dataset.stepLoopLength).toBe("6");
    expect(getLoopHandle(step, "start").textContent).toBe("3");
    expect(changes).toContainEqual(
      expect.objectContaining({ type: "loop", loop: { start: 3, end: 8 } }),
    );
  });

  test("roll cells toggle active state on click", () => {
    let cell = getStepCell(step, 1, 1);
    const changes: unknown[] = [];
    expect(cell.classList.contains("is-active")).toBe(false);
    expect(cell.getAttribute("aria-pressed")).toBe("false");
    step.addEventListener("step-change", (event) =>
      changes.push((event as CustomEvent).detail),
    );

    cell.click();

    cell = getStepCell(step, 1, 1);
    expect(cell.classList.contains("is-active")).toBe(true);
    expect(cell.getAttribute("aria-pressed")).toBe("true");
    expect(changes).toContainEqual(
      expect.objectContaining({ type: "cell", step: 1, lane: 1, active: true }),
    );

    cell.click();

    cell = getStepCell(step, 1, 1);
    expect(cell.classList.contains("is-active")).toBe(false);
    expect(cell.getAttribute("aria-pressed")).toBe("false");
    expect(changes).toContainEqual(
      expect.objectContaining({
        type: "cell",
        step: 1,
        lane: 1,
        active: false,
      }),
    );
  });

  test("active note markers stay inset inside their grid cells", () => {
    const cell = getStepCell(step, 1, 1);

    cell.click();

    const updatedCell = getStepCell(step, 1, 1);
    const marker = updatedCell.querySelector<HTMLElement>(".step-sequencer__note");
    expect(marker).not.toBeNull();

    const cellRect = updatedCell.getBoundingClientRect();
    const markerRect = marker!.getBoundingClientRect();

    expect(markerRect.left).toBeGreaterThan(cellRect.left);
    expect(markerRect.top).toBeGreaterThan(cellRect.top);
    expect(markerRect.right).toBeLessThan(cellRect.right);
    expect(markerRect.bottom).toBeLessThan(cellRect.bottom);
  });

  test("colors active notes from bar position", () => {
    const barStart = getStepCell(step, 1, 1);
    const innerStep = getStepCell(step, 2, 1);

    barStart.click();
    innerStep.click();

    const blueMarker = getStepCell(step, 1, 1).querySelector<HTMLElement>(
      ".step-sequencer__note",
    );
    const orangeMarker = getStepCell(step, 2, 1).querySelector<HTMLElement>(
      ".step-sequencer__note",
    );

    expect(blueMarker?.dataset.stepNoteAccent).toBe("blue");
    expect(orangeMarker?.dataset.stepNoteAccent).toBe("orange");
    expect(getStepCell(step, 5, 1).dataset.stepBarStart).toBe("true");
  });
});
