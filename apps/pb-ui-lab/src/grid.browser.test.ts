import { beforeEach, describe, expect, test } from "vitest";
import { renderPatchbayLab } from "./main";

function renderGrid(): HTMLElement {
  document.body.innerHTML = '<div id="app"></div>';
  const app = document.querySelector<HTMLElement>("#app");
  expect(app).not.toBeNull();

  renderPatchbayLab(app!);

  const grid = document.querySelector<HTMLElement>(
    '[id="grid"] sequencer-grid',
  );
  expect(grid).not.toBeNull();
  return grid!;
}

function getGridCell(index: number): HTMLButtonElement {
  const cell = document.querySelector<HTMLButtonElement>(
    `[data-grid-cell="${index}"]`,
  );
  expect(cell).not.toBeNull();
  return cell!;
}

function getDirectionControl(index: number): HTMLButtonElement {
  const direction = document.querySelector<HTMLButtonElement>(
    `[data-grid-direction-control="${index}"]`,
  );
  expect(direction).not.toBeNull();
  return direction!;
}

function getDirectionIconBorders(button: HTMLButtonElement): {
  left: string;
  right: string;
} {
  const before = getComputedStyle(button, "::before");
  return {
    left: before.borderLeftWidth,
    right: before.borderRightWidth,
  };
}

describe("grid browser interactions", () => {
  beforeEach(() => {
    renderGrid();
  });

  test("top grid cells place row markers from pointer position", () => {
    let cell = getGridCell(1);
    expect(cell.classList.contains("is-active")).toBe(false);
    expect(cell.dataset.gridState).toBe("inactive");
    expect(cell.getAttribute("aria-pressed")).toBe("false");

    const rect = cell.getBoundingClientRect();
    const changes: unknown[] = [];
    document
      .querySelector<HTMLElement>('[id="grid"] sequencer-grid')!
      .addEventListener("grid-change", (event) =>
        changes.push((event as CustomEvent).detail),
      );

    cell.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height * 0.18,
      }),
    );

    cell = getGridCell(1);
    expect(cell.classList.contains("is-active")).toBe(true);
    expect(cell.dataset.gridState).toBe("active");
    expect(cell.getAttribute("aria-pressed")).toBe("true");
    expect(Number(cell.dataset.gridY)).toBeCloseTo(0.2, 1);
    expect(cell.style.getPropertyValue("--grid-marker-y")).toContain("%");
    expect(changes).toContainEqual(
      expect.objectContaining({ type: "cell", index: 1, active: true }),
    );

    cell.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height * 0.82,
      }),
    );

    cell = getGridCell(1);
    expect(cell.classList.contains("is-active")).toBe(true);
    expect(cell.dataset.gridState).toBe("active");
    expect(Number(cell.dataset.gridY)).toBeCloseTo(0.8, 1);
    expect(cell.getAttribute("aria-label")).toContain("row");
    const latestCellChange = changes[changes.length - 1] as { y: number };
    expect(latestCellChange).toEqual(
      expect.objectContaining({ type: "cell", index: 1, active: true }),
    );
    expect(latestCellChange.y).toBeCloseTo(0.8, 1);
  });

  test("top grid cells can be removed from the same row with the keyboard", () => {
    let cell = getGridCell(1);

    cell.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
    );

    cell = getGridCell(1);
    expect(cell.classList.contains("is-active")).toBe(true);
    expect(cell.dataset.gridState).toBe("active");

    cell.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
    );

    cell = getGridCell(1);
    expect(cell.classList.contains("is-active")).toBe(false);
    expect(cell.dataset.gridState).toBe("inactive");
  });

  test("direction controls cycle right to left to off", () => {
    let direction = getDirectionControl(1);
    const changes: unknown[] = [];
    document
      .querySelector<HTMLElement>('[id="grid"] sequencer-grid')!
      .addEventListener("grid-change", (event) =>
        changes.push((event as CustomEvent).detail),
      );
    expect(direction.dataset.gridDirection).toBe("right");
    expect(direction.dataset.gridDirectionValue).toBe("1");
    expect(direction.classList.contains("is-direction-right")).toBe(true);
    expect(direction.getAttribute("aria-label")).toBe(
      "Grid direction 1: right",
    );
    expect(getDirectionIconBorders(direction)).toEqual({
      left: "6px",
      right: "0px",
    });

    direction.click();

    direction = getDirectionControl(1);
    expect(direction.dataset.gridDirection).toBe("left");
    expect(direction.dataset.gridDirectionValue).toBe("-1");
    expect(direction.classList.contains("is-direction-left")).toBe(true);
    expect(direction.getAttribute("aria-label")).toBe("Grid direction 1: left");
    expect(getDirectionIconBorders(direction)).toEqual({
      left: "0px",
      right: "6px",
    });
    expect(changes[changes.length - 1]).toEqual(
      expect.objectContaining({
        type: "direction",
        index: 1,
        direction: "left",
      }),
    );

    direction.click();

    direction = getDirectionControl(1);
    expect(direction.dataset.gridDirection).toBe("off");
    expect(direction.dataset.gridDirectionValue).toBe("0");
    expect(direction.classList.contains("is-direction-off")).toBe(true);
    expect(direction.getAttribute("aria-label")).toBe("Grid direction 1: off");
    expect(getDirectionIconBorders(direction)).toEqual({
      left: "0px",
      right: "0px",
    });

    direction.click();

    direction = getDirectionControl(1);
    expect(direction.dataset.gridDirection).toBe("right");
    expect(direction.dataset.gridDirectionValue).toBe("1");
    expect(direction.classList.contains("is-direction-right")).toBe(true);
    expect(direction.getAttribute("aria-label")).toBe(
      "Grid direction 1: right",
    );
  });

  test("direction controls render their configured arrow states", () => {
    const directions = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        "[data-grid-direction-control]",
      ),
    );
    expect(directions).toHaveLength(16);

    directions.forEach((button) => {
      expect(button.classList.contains("is-active")).toBe(false);
      const direction = button.dataset.gridDirection;
      expect(["right", "left", "off"]).toContain(direction);
      expect(button.classList.contains(`is-direction-${direction}`)).toBe(true);
    });
  });
});
