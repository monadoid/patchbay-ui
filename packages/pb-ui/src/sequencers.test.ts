import { describe, expect, test } from "vitest";
import {
  cycleGridDirection,
  createGridState,
  createStepKeyChange,
  createStepSequencerState,
  stepNoteAccent,
  selectStepKey,
  selectStepLoopBar,
  setStepLoopEnd,
  setStepLoopStart,
  toggleGridCell,
  toggleStepNote,
} from "./sequencers";

describe("grid headless state helpers", () => {
  test("creates complete default grid state", () => {
    const grid = createGridState();

    expect(grid.cells).toHaveLength(16);
    expect(grid.directions).toHaveLength(16);
    expect(grid.cells.every((cell) => cell.active === false)).toBe(true);
    expect(grid.directions.every((direction) => direction === "right")).toBe(
      true,
    );
  });

  test("activates, moves, and deactivates a grid cell by quantized row", () => {
    const initial = createGridState();
    const activated = toggleGridCell(initial, 1, 0.18);

    expect(activated.change).toEqual(
      expect.objectContaining({ active: true, index: 1, type: "cell" }),
    );
    expect(activated.state.cells[0]).toEqual({
      active: true,
      color: "blue",
      y: 0.2,
    });

    const moved = toggleGridCell(activated.state, 1, 0.82);
    expect(moved.change).toEqual(
      expect.objectContaining({ active: true, index: 1, type: "cell" }),
    );
    expect(moved.state.cells[0]?.y).toBeCloseTo(0.8, 3);

    const deactivated = toggleGridCell(moved.state, 1, 0.82);
    expect(deactivated.change).toEqual(
      expect.objectContaining({ active: false, index: 1, type: "cell" }),
    );
    expect(deactivated.state.cells[0]?.active).toBe(false);
  });

  test("cycles grid directions right to left to off", () => {
    const initial = createGridState();
    const left = cycleGridDirection(initial, 1);
    const off = cycleGridDirection(left.state, 1);
    const right = cycleGridDirection(off.state, 1);

    expect(left.change).toEqual(
      expect.objectContaining({
        direction: "left",
        index: 1,
        type: "direction",
      }),
    );
    expect(off.change).toEqual(
      expect.objectContaining({
        direction: "off",
        index: 1,
        type: "direction",
      }),
    );
    expect(right.change).toEqual(
      expect.objectContaining({
        direction: "right",
        index: 1,
        type: "direction",
      }),
    );
  });

  test("toggles and cycles the final cell in wider grids", () => {
    const initial = createGridState({
      cells: Array.from({ length: 24 }, () => ({
        active: false,
        y: 0.5,
        color: "blue",
      })),
    });
    const activated = toggleGridCell(initial, 24, 0.18);
    const cycled = cycleGridDirection(activated.state, 24);

    expect(activated.change).toEqual(
      expect.objectContaining({ active: true, index: 24, type: "cell" }),
    );
    expect(activated.state.cells).toHaveLength(24);
    expect(activated.state.cells[23]).toEqual({
      active: true,
      color: "blue",
      y: 0.2,
    });
    expect(cycled.change).toEqual(
      expect.objectContaining({
        direction: "left",
        index: 24,
        type: "direction",
      }),
    );
  });
});

describe("step headless state helpers", () => {
  test("creates complete default step state", () => {
    const step = createStepSequencerState();

    expect(step.activeKey).toBe("C4");
    expect(step.loop).toEqual({ start: 1, end: 16 });
    expect(step.bars).toBe(4);
    expect(step.notes).toEqual([]);
  });

  test("selects keys and cycles loop spans by bar", () => {
    const initial = createStepSequencerState();
    const key = selectStepKey(initial, "D#4");
    const barTwo = selectStepLoopBar(key.state, 2);
    const extended = selectStepLoopBar(barTwo.state, 2);

    expect(key.change).toEqual(
      expect.objectContaining({ key: "D#4", type: "key" }),
    );
    expect(barTwo.change).toEqual(
      expect.objectContaining({ loop: { start: 5, end: 8 }, type: "loop" }),
    );
    expect(extended.change).toEqual(
      expect.objectContaining({ loop: { start: 5, end: 12 }, type: "loop" }),
    );
  });

  test("trims loop start and end while preserving ordered ranges", () => {
    const initial = createStepSequencerState();
    const end = setStepLoopEnd(initial, 8);
    const start = setStepLoopStart(end.state, 3);
    const clampedStart = setStepLoopStart(start.state, 12);

    expect(end.change).toEqual(
      expect.objectContaining({ loop: { start: 1, end: 8 }, type: "loop" }),
    );
    expect(start.change).toEqual(
      expect.objectContaining({ loop: { start: 3, end: 8 }, type: "loop" }),
    );
    expect(clampedStart.state.loop).toEqual({ start: 8, end: 8 });
  });

  test("creates momentary key press and release changes", () => {
    const initial = createStepSequencerState();
    const press = createStepKeyChange(initial, "D#4", true);
    const release = createStepKeyChange(initial, "D#4", false);

    expect(press).toEqual(
      expect.objectContaining({
        activeKey: "C4",
        key: "D#4",
        phase: "press",
        pressed: true,
        type: "key",
      }),
    );
    expect(release).toEqual(
      expect.objectContaining({
        activeKey: "C4",
        key: "D#4",
        phase: "release",
        pressed: false,
        type: "key",
      }),
    );
  });

  test("toggles notes without duplicating step/lane pairs", () => {
    const initial = createStepSequencerState();
    const added = toggleStepNote(initial, 1, 7);
    const removed = toggleStepNote(added.state, 1, 7);

    expect(added.change).toEqual(
      expect.objectContaining({ active: true, lane: 7, step: 1, type: "cell" }),
    );
    expect(added.state.notes).toEqual([
      { duration: 1, lane: 7, step: 1, velocity: 1 },
    ]);
    expect(removed.change).toEqual(
      expect.objectContaining({
        active: false,
        lane: 7,
        step: 1,
        type: "cell",
      }),
    );
    expect(removed.state.notes).toEqual([]);
  });

  test("derives note accent colors from bar starts instead of note data", () => {
    expect(stepNoteAccent(1)).toBe("blue");
    expect(stepNoteAccent(2)).toBe("orange");
    expect(stepNoteAccent(4)).toBe("orange");
    expect(stepNoteAccent(5)).toBe("blue");
    expect(stepNoteAccent(9)).toBe("blue");
    expect(stepNoteAccent(13)).toBe("blue");
  });
});
