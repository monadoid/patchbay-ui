import {
  gridPropsSchema,
  stepSequencerPropsSchema,
  type GridCell,
  type GridDirection,
  type GridProps,
  type StepKey,
  type StepNote,
  type StepSequencerProps,
} from "./api";

export type GridState = GridProps;
export type StepSequencerState = StepSequencerProps;

export type GridCellChange = {
  active: boolean;
  cells: GridCell[];
  directions: GridDirection[];
  index: number;
  type: "cell";
  y: number;
};

export type GridDirectionChange = {
  cells: GridCell[];
  direction: GridDirection;
  directions: GridDirection[];
  index: number;
  type: "direction";
};

export type GridStateChange = GridCellChange | GridDirectionChange;

export type StepKeyChange = {
  activeKey: StepKey;
  bars: number;
  key: StepKey;
  loop: StepSequencerState["loop"];
  notes: StepNote[];
  phase: "press" | "release";
  pressed: boolean;
  type: "key";
};

export type StepCellChange = {
  active: boolean;
  activeKey: StepKey;
  bars: number;
  lane: number;
  loop: StepSequencerState["loop"];
  notes: StepNote[];
  step: number;
  type: "cell";
};

export type StepLoopChange = {
  activeKey: StepKey;
  bars: number;
  loop: StepSequencerState["loop"];
  notes: StepNote[];
  type: "loop";
};

export type StepSequencerStateChange =
  | StepKeyChange
  | StepCellChange
  | StepLoopChange;

export const gridColumnCount = 16;
export const gridRowCount = 16;
export const stepLaneCount = 8;
export const stepStepCount = 16;
export const stepStepsPerBar = 4;
export type StepNoteAccent = "orange" | "blue";
export const stepKeys = [
  "C4",
  "C#4",
  "D4",
  "D#4",
  "E4",
  "F4",
  "F#4",
  "G4",
  "G#4",
] as const satisfies readonly StepKey[];

const directionCycle = [
  "right",
  "left",
  "off",
] as const satisfies readonly GridDirection[];
const loopLengths = [1, 2, 4] as const;
const sameRowTolerance = 1 / (gridRowCount - 1) / 2;

export function createGridState(
  input: Partial<GridProps> = {},
): GridState {
  const state = gridPropsSchema.parse(input);

  return {
    ...state,
    cells: state.cells.map((cell) => ({ ...cell })),
    directions: [...state.directions],
  };
}

export function toggleGridCell(
  stateInput: GridState,
  index: number,
  y: number,
): { change: GridCellChange; state: GridState } {
  const state = createGridState(stateInput);
  const cellIndex = clampInteger(index, 1, state.cells.length) - 1;
  const current = state.cells[cellIndex] ?? defaultGridCell();
  const nextY = quantizeGridY(y);
  const shouldDeactivate =
    current.active && Math.abs(current.y - nextY) <= sameRowTolerance;
  const nextCell = shouldDeactivate
    ? { ...current, active: false }
    : { ...current, active: true, y: nextY };
  const cells = state.cells.map((cell, nextIndex) =>
    nextIndex === cellIndex ? nextCell : cell,
  );
  const nextState = createGridState({ ...state, cells });

  return {
    change: {
      active: nextCell.active,
      cells: nextState.cells,
      directions: nextState.directions,
      index: cellIndex + 1,
      type: "cell",
      y: nextCell.y,
    },
    state: nextState,
  };
}

export function cycleGridDirection(
  stateInput: GridState,
  index: number,
): { change: GridDirectionChange; state: GridState } {
  const state = createGridState(stateInput);
  const directionIndex = clampInteger(index, 1, state.directions.length) - 1;
  const current = normalizeDirection(state.directions[directionIndex]);
  const nextDirection =
    directionCycle[
      (directionCycle.indexOf(current) + 1) % directionCycle.length
    ] ?? "right";
  const directions = state.directions.map((direction, nextIndex) =>
    nextIndex === directionIndex ? nextDirection : direction,
  );
  const nextState = createGridState({ ...state, directions });

  return {
    change: {
      cells: nextState.cells,
      direction: nextDirection,
      directions: nextState.directions,
      index: directionIndex + 1,
      type: "direction",
    },
    state: nextState,
  };
}

export function quantizeGridY(value: number): number {
  return (
    Math.round(clamp(value, 0, 1) * (gridRowCount - 1)) / (gridRowCount - 1)
  );
}

export function gridRowFromY(value: number): number {
  return (
    gridRowCount - Math.round(quantizeGridY(value) * (gridRowCount - 1))
  );
}

export function createStepSequencerState(
  input: Partial<StepSequencerProps> = {},
): StepSequencerState {
  const state = stepSequencerPropsSchema.parse(input);

  return {
    ...state,
    loop: { ...state.loop },
    notes: state.notes.map((note) => ({ ...note })),
  };
}

export function selectStepKey(
  stateInput: StepSequencerState,
  key: StepKey,
): { change: StepKeyChange; state: StepSequencerState } {
  const state = createStepSequencerState(stateInput);
  const nextState = createStepSequencerState({ ...state, activeKey: key });

  return {
    change: {
      activeKey: nextState.activeKey,
      bars: nextState.bars,
      key: nextState.activeKey,
      loop: nextState.loop,
      notes: nextState.notes,
      phase: "press",
      pressed: true,
      type: "key",
    },
    state: nextState,
  };
}

export function createStepKeyChange(
  stateInput: StepSequencerState,
  key: StepKey,
  pressed: boolean,
): StepKeyChange {
  const state = createStepSequencerState(stateInput);

  return {
    activeKey: state.activeKey,
    bars: state.bars,
    key,
    loop: state.loop,
    notes: state.notes,
    phase: pressed ? "press" : "release",
    pressed,
    type: "key",
  };
}

export function selectStepLoopBar(
  stateInput: StepSequencerState,
  bar: number,
): { change: StepLoopChange; state: StepSequencerState } {
  const state = createStepSequencerState(stateInput);
  const barCount = Math.ceil(stepStepCount / stepStepsPerBar);
  const nextStartBar = clampInteger(bar, 1, barCount) - 1;
  const currentStartBar = Math.floor(
    (state.loop.start - 1) / stepStepsPerBar,
  );
  const currentLoopBars = Math.max(
    1,
    Math.ceil((state.loop.end - state.loop.start + 1) / stepStepsPerBar),
  );
  const nextLoopBars =
    currentStartBar === nextStartBar
      ? nextLoopLength(nextStartBar, currentLoopBars, barCount)
      : 1;
  const loop = {
    start: nextStartBar * stepStepsPerBar + 1,
    end: nextStartBar * stepStepsPerBar + nextLoopBars * stepStepsPerBar,
  };
  const nextState = createStepSequencerState({ ...state, loop });

  return {
    change: {
      activeKey: nextState.activeKey,
      bars: nextState.bars,
      loop: nextState.loop,
      notes: nextState.notes,
      type: "loop",
    },
    state: nextState,
  };
}

export function setStepLoopStart(
  stateInput: StepSequencerState,
  start: number,
): { change: StepLoopChange; state: StepSequencerState } {
  const state = createStepSequencerState(stateInput);
  const loop = {
    start: clampInteger(start, 1, state.loop.end),
    end: state.loop.end,
  };

  return createStepLoopResult(state, loop);
}

export function setStepLoopEnd(
  stateInput: StepSequencerState,
  end: number,
): { change: StepLoopChange; state: StepSequencerState } {
  const state = createStepSequencerState(stateInput);
  const loop = {
    start: state.loop.start,
    end: clampInteger(end, state.loop.start, stepStepCount),
  };

  return createStepLoopResult(state, loop);
}

export function toggleStepNote(
  stateInput: StepSequencerState,
  step: number,
  lane: number,
): { change: StepCellChange; state: StepSequencerState } {
  const state = createStepSequencerState(stateInput);
  const nextStep = clampInteger(step, 1, stepStepCount);
  const nextLane = clampInteger(lane, 1, stepLaneCount);
  const exists = state.notes.some(
    (note) => note.step === nextStep && note.lane === nextLane,
  );
  const notes = exists
    ? state.notes.filter(
        (note) => note.step !== nextStep || note.lane !== nextLane,
      )
    : [
        ...state.notes,
        {
          duration: 1,
          lane: nextLane,
          step: nextStep,
          velocity: 1,
        },
      ];
  const nextState = createStepSequencerState({ ...state, notes });

  return {
    change: {
      active: !exists,
      activeKey: nextState.activeKey,
      bars: nextState.bars,
      lane: nextLane,
      loop: nextState.loop,
      notes: nextState.notes,
      step: nextStep,
      type: "cell",
    },
    state: nextState,
  };
}

export function stepLoopBarState(
  loop: StepSequencerState["loop"],
  bar: number,
): { active: boolean; inLoop: boolean } {
  const start = (bar - 1) * stepStepsPerBar + 1;
  const end = start + stepStepsPerBar - 1;

  return {
    active: start === loop.start,
    inLoop: start <= loop.end && end >= loop.start,
  };
}

export function stepNoteAccent(step: number): StepNoteAccent {
  return (clampInteger(step, 1, stepStepCount) - 1) % stepStepsPerBar === 0
    ? "blue"
    : "orange";
}

function createStepLoopResult(
  state: StepSequencerState,
  loop: StepSequencerState["loop"],
): { change: StepLoopChange; state: StepSequencerState } {
  const nextState = createStepSequencerState({ ...state, loop });

  return {
    change: {
      activeKey: nextState.activeKey,
      bars: nextState.bars,
      loop: nextState.loop,
      notes: nextState.notes,
      type: "loop",
    },
    state: nextState,
  };
}

function defaultGridCell(): GridCell {
  return {
    active: false,
    color: "blue",
    y: 0.5,
  };
}

function normalizeDirection(
  direction: GridDirection | undefined,
): GridDirection {
  return direction === "left" || direction === "off" || direction === "right"
    ? direction
    : "right";
}

function nextLoopLength(
  startBar: number,
  currentLength: number,
  barCount: number,
): number {
  const maxLength = barCount - startBar;
  const allowed = loopLengths.filter((length) => length <= maxLength);
  const currentIndex = allowed.indexOf(
    currentLength as (typeof loopLengths)[number],
  );

  return allowed[(currentIndex + 1) % allowed.length] ?? 1;
}

function clampInteger(value: number, min: number, max: number): number {
  return Math.round(clamp(value, min, max));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
