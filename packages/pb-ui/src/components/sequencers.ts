import {
  createGridState,
  createStepKeyChange,
  createStepSequencerState,
  cycleGridDirection,
  gridRowFromY,
  stepKeys,
  stepLaneCount,
  stepNoteAccent,
  stepStepCount,
  stepStepsPerBar,
  setStepLoopEnd,
  setStepLoopStart,
  toggleGridCell,
  toggleStepNote,
  type GridState,
  type GridStateChange,
  type StepSequencerState,
  type StepSequencerStateChange,
} from "../sequencers";
import type {
  GridCell,
  GridDirection,
  StepKey,
  StepLoop,
  StepNote,
} from "../api";

export function defineSequencerElements(): void {
  if (!customElements.get("sequencer-grid")) {
    customElements.define("sequencer-grid", GridElement);
  }

  if (!customElements.get("step-sequencer")) {
    customElements.define("step-sequencer", StepElement);
  }
}

class GridElement extends HTMLElement {
  static observedAttributes = ["cells", "directions", "measure-size"];

  private state: GridState = createGridState();

  get cells(): GridCell[] {
    return this.state.cells.map((cell) => ({ ...cell }));
  }

  set cells(cells: GridCell[]) {
    this.updateState({ cells });
  }

  get directions(): GridDirection[] {
    return [...this.state.directions];
  }

  set directions(directions: GridDirection[]) {
    this.updateState({ directions });
  }

  get measureSize(): number {
    return this.state.measureSize;
  }

  set measureSize(measureSize: number) {
    this.updateState({ measureSize });
  }

  connectedCallback(): void {
    this.classList.add("grid");
    this.setAttribute("role", this.getAttribute("role") ?? "group");
    this.render();
  }

  attributeChangedCallback(): void {
    this.syncStateFromAttributes();
    if (this.isConnected) {
      this.render();
    }
  }

  private updateState(next: Partial<GridState>): void {
    this.state = createGridState({ ...this.state, ...next });
    if (this.isConnected) {
      this.render();
    }
  }

  private syncStateFromAttributes(): void {
    this.state = createGridState({
      ...this.state,
      cells: jsonAttribute<GridCell[]>(this, "cells") ?? this.state.cells,
      directions:
        jsonAttribute<GridDirection[]>(this, "directions") ??
        this.state.directions,
      measureSize:
        numberAttribute(this, "measure-size") ?? this.state.measureSize,
    });
  }

  private render(): void {
    this.replaceChildren();

    this.state.cells.forEach((cell, index) => {
      const button = document.createElement("button");
      const column = index + 1;
      const row = gridRowFromY(cell.y);

      button.type = "button";
      button.className = cell.active
        ? "grid__cell is-active"
        : "grid__cell";
      button.dataset.gridCell = String(column);
      button.dataset.gridColumn = String(column);
      button.dataset.gridRole = "cell";
      button.dataset.gridState = cell.active ? "active" : "inactive";
      button.dataset.gridY = cell.y.toFixed(4);
      button.style.setProperty("--grid-marker-y", `${cell.y * 100}%`);
      button.setAttribute("aria-pressed", String(cell.active));
      button.setAttribute(
        "aria-label",
        cell.active
          ? `Grid column ${column}, row ${row}`
          : `Grid column ${column}, inactive`,
      );
      button.addEventListener("pointerdown", (event) =>
        this.handleCellPointer(event, column),
      );
      button.addEventListener("keydown", (event) =>
        this.handleCellKeydown(event, column, cell.y),
      );
      this.append(button);
    });

    this.state.directions.forEach((direction, index) => {
      const button = document.createElement("button");
      const column = index + 1;

      button.type = "button";
      button.className = `grid__direction is-direction-${direction}`;
      button.dataset.gridDirection = direction;
      button.dataset.gridDirectionControl = String(column);
      button.dataset.gridDirectionValue = gridDirectionValue(direction);
      button.dataset.gridRole = "direction";
      button.setAttribute(
        "aria-label",
        `Grid direction ${column}: ${direction}`,
      );
      button.title = direction;
      button.addEventListener("click", () => this.handleDirectionClick(column));
      this.append(button);
    });
  }

  private handleCellPointer(event: PointerEvent, column: number): void {
    if (event.button !== 0) return;

    event.preventDefault();
    const button = event.currentTarget as HTMLButtonElement;
    const rect = button.getBoundingClientRect();
    const y =
      rect.height > 0
        ? (event.clientY - rect.top) / rect.height
        : (this.state.cells[column - 1]?.y ?? 0.5);
    const { change, state } = toggleGridCell(this.state, column, y);

    this.state = state;
    this.render();
    this.dispatchGridChange(change);
  }

  private handleCellKeydown(
    event: KeyboardEvent,
    column: number,
    y: number,
  ): void {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    const { change, state } = toggleGridCell(this.state, column, y);

    this.state = state;
    this.render();
    this.dispatchGridChange(change);
  }

  private handleDirectionClick(column: number): void {
    const { change, state } = cycleGridDirection(this.state, column);

    this.state = state;
    this.render();
    this.dispatchGridChange(change);
  }

  private dispatchGridChange(detail: GridStateChange): void {
    this.dispatchEvent(
      new CustomEvent<GridStateChange>("grid-change", {
        bubbles: true,
        composed: true,
        detail,
      }),
    );
  }
}

class StepElement extends HTMLElement {
  static observedAttributes = ["active-key", "bars", "loop", "notes"];

  private keyPressAbortController?: AbortController;
  private loopDragAbortController?: AbortController;
  private pressedKey: StepKey | null = null;
  private state: StepSequencerState = createStepSequencerState();

  get activeKey(): StepKey {
    return this.state.activeKey;
  }

  set activeKey(activeKey: StepKey) {
    this.updateState({ activeKey });
  }

  get notes(): StepNote[] {
    return this.state.notes.map((note) => ({ ...note }));
  }

  set notes(notes: StepNote[]) {
    this.updateState({ notes });
  }

  get loop(): StepLoop {
    return { ...this.state.loop };
  }

  set loop(loop: StepLoop) {
    this.updateState({ loop });
  }

  get bars(): number {
    return this.state.bars;
  }

  set bars(bars: number) {
    this.updateState({ bars });
  }

  connectedCallback(): void {
    this.classList.add("step-sequencer");
    this.setAttribute("role", this.getAttribute("role") ?? "group");
    this.render();
  }

  disconnectedCallback(): void {
    this.keyPressAbortController?.abort();
    this.loopDragAbortController?.abort();
    this.keyPressAbortController = undefined;
    this.loopDragAbortController = undefined;
    this.pressedKey = null;
  }

  attributeChangedCallback(): void {
    this.syncStateFromAttributes();
    if (this.isConnected) {
      this.render();
    }
  }

  private updateState(next: Partial<StepSequencerState>): void {
    this.state = createStepSequencerState({ ...this.state, ...next });
    if (this.isConnected) {
      this.render();
    }
  }

  private syncStateFromAttributes(): void {
    this.state = createStepSequencerState({
      ...this.state,
      activeKey:
        (this.getAttribute("active-key") as StepKey | null) ??
        this.state.activeKey,
      bars: numberAttribute(this, "bars") ?? this.state.bars,
      loop: jsonAttribute<StepLoop>(this, "loop") ?? this.state.loop,
      notes: jsonAttribute<StepNote[]>(this, "notes") ?? this.state.notes,
    });
  }

  private render(): void {
    this.replaceChildren();
    const displayKey = this.pressedKey ?? this.state.activeKey;

    this.dataset.activeKey = this.state.activeKey;
    this.dataset.activeKeyIndex = String(
      stepKeys.indexOf(this.state.activeKey) + 1,
    );
    if (this.pressedKey) {
      this.dataset.pressedKey = this.pressedKey;
      this.dataset.pressedKeyIndex = String(
        stepKeys.indexOf(this.pressedKey) + 1,
      );
    } else {
      delete this.dataset.pressedKey;
      delete this.dataset.pressedKeyIndex;
    }
    this.dataset.loopStart = String(this.state.loop.start);
    this.dataset.loopEnd = String(this.state.loop.end);
    this.dataset.loopLength = String(
      this.state.loop.end - this.state.loop.start + 1,
    );
    this.dataset.loopBar = String(
      Math.floor((this.state.loop.start - 1) / stepStepsPerBar) + 1,
    );
    this.setAttribute(
      "aria-label",
      `Step sequencer, key ${displayKey}, loop steps ${this.state.loop.start} through ${this.state.loop.end}`,
    );

    this.append(
      this.renderLoopRuler(),
      this.renderLabels(),
      this.renderKeys(),
      this.renderRoll(),
    );
  }

  private renderLabels(): HTMLElement {
    const labels = document.createElement("div");
    const activeKey = document.createElement("span");
    const displayKey = this.pressedKey ?? this.state.activeKey;

    labels.className = "step-sequencer__labels";
    activeKey.textContent = displayKey;
    labels.append(activeKey);

    return labels;
  }

  private renderKeys(): HTMLElement {
    const keys = document.createElement("div");
    keys.className = "step-sequencer__keys";
    keys.setAttribute("role", "group");
    keys.setAttribute("aria-label", "Pitch keys");

    stepKeys.forEach((key, index) => {
      const button = document.createElement("span");
      const tone = key.includes("#") ? "black" : "white";
      const pressed = key === this.pressedKey;

      button.className = tone === "black" ? "is-black" : "is-white";
      button.dataset.stepKey = String(index + 1);
      button.dataset.stepKeyState = pressed ? "pressed" : "idle";
      button.dataset.stepKeyTone = tone;
      button.setAttribute("aria-label", `Key ${key}`);
      button.setAttribute("aria-pressed", String(pressed));
      button.setAttribute("role", "button");
      button.setAttribute("tabindex", "0");
      button.classList.toggle("is-active", pressed);
      button.addEventListener("pointerdown", (event) =>
        this.handleKeyPointerDown(event, key),
      );
      button.addEventListener("keydown", (event) =>
        this.handleKeyKeydown(event, key),
      );
      button.addEventListener("keyup", (event) =>
        this.handleKeyKeyup(event, key),
      );
      button.addEventListener("blur", () => this.releaseKey(key));
      keys.append(button);
    });

    return keys;
  }

  private renderRoll(): HTMLElement {
    const roll = document.createElement("div");
    roll.className = "step-sequencer__roll";
    roll.setAttribute("role", "grid");
    roll.setAttribute("aria-label", "Step notes");
    roll.setAttribute("aria-rowcount", String(stepLaneCount));
    roll.setAttribute("aria-colcount", String(stepStepCount));

    Array.from({ length: stepStepCount * stepLaneCount }, (_, index) => {
      const step = (index % stepStepCount) + 1;
      const lane = Math.floor(index / stepStepCount) + 1;
      const note = this.state.notes.find(
        (candidate) => candidate.step === step && candidate.lane === lane,
      );
      const accent = stepNoteAccent(step);
      const button = document.createElement("button");

      button.type = "button";
      button.dataset.stepBarStart = String(accent === "blue");
      button.setAttribute("aria-label", `Step ${step}, lane ${lane}`);
      button.setAttribute("aria-colindex", String(step));
      button.setAttribute("aria-rowindex", String(lane));
      button.setAttribute("aria-pressed", String(Boolean(note)));
      button.setAttribute("aria-selected", String(Boolean(note)));
      button.setAttribute("role", "gridcell");
      button.className = note ? "is-active" : "";
      button.addEventListener("click", () => this.handleNoteToggle(step, lane));

      if (note) {
        const marker = document.createElement("span");

        marker.className = ["step-sequencer__note", `is-${accent}`].join(" ");
        marker.dataset.stepNoteAccent = accent;
        button.append(marker);
      }

      roll.append(button);
    });

    return roll;
  }

  private renderLoopRuler(): HTMLElement {
    const ruler = document.createElement("div");
    const track = document.createElement("div");
    const range = document.createElement("div");
    const startHandle = this.renderLoopHandle("start");
    const endHandle = this.renderLoopHandle("end");

    ruler.className = "step-sequencer__loop-ruler";
    ruler.dataset.stepLoopRuler = "true";
    ruler.setAttribute("role", "group");
    ruler.setAttribute("aria-label", "Loop selector");

    track.className = "step-sequencer__loop-track";
    track.dataset.stepLoopTrack = "true";

    range.className = "step-sequencer__loop-range";
    range.dataset.stepLoopRange = "true";
    range.dataset.stepLoopStart = String(this.state.loop.start);
    range.dataset.stepLoopEnd = String(this.state.loop.end);
    range.dataset.stepLoopLength = String(
      this.state.loop.end - this.state.loop.start + 1,
    );
    range.style.gridColumn = `${this.state.loop.start} / ${this.state.loop.end + 1}`;
    range.setAttribute(
      "aria-label",
      `Loop steps ${this.state.loop.start} through ${this.state.loop.end}`,
    );

    range.append(startHandle, endHandle);
    ruler.append(track, range);

    return ruler;
  }

  private renderLoopHandle(edge: "start" | "end"): HTMLButtonElement {
    const handle = document.createElement("button");
    const arrow = document.createElement("span");
    const label = document.createElement("span");
    const step = edge === "start" ? this.state.loop.start : this.state.loop.end;
    const direction = edge === "start" ? "right" : "left";

    handle.type = "button";
    handle.className = `step-sequencer__loop-handle is-${edge}`;
    handle.dataset.stepLoopHandle = edge;
    arrow.className = `step-sequencer__loop-arrow is-${direction}`;
    arrow.dataset.stepLoopArrow = direction;
    arrow.setAttribute("aria-hidden", "true");
    label.className = "step-sequencer__loop-label";
    label.textContent = String(step);
    handle.append(...(edge === "start" ? [label, arrow] : [arrow, label]));
    handle.setAttribute(
      "aria-label",
      `${edge === "start" ? "Loop start" : "Loop end"} step ${step}`,
    );
    handle.addEventListener("pointerdown", (event) =>
      this.handleLoopPointerDown(event, edge),
    );
    handle.addEventListener("keydown", (event) =>
      this.handleLoopHandleKeydown(event, edge),
    );

    return handle;
  }

  private handleKeyPointerDown(event: PointerEvent, key: StepKey): void {
    if (event.button !== 0) return;

    event.preventDefault();
    this.pressKey(key);
    this.watchPointerRelease(key);
  }

  private handleKeyKeydown(event: KeyboardEvent, key: StepKey): void {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    if (!event.repeat) {
      this.pressKey(key);
    }
  }

  private handleKeyKeyup(event: KeyboardEvent, key: StepKey): void {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    this.releaseKey(key);
  }

  private pressKey(key: StepKey): void {
    if (this.pressedKey === key) return;

    if (this.pressedKey) {
      this.releaseKey();
    }

    this.pressedKey = key;
    this.render();
    this.dispatchStepChange(createStepKeyChange(this.state, key, true));
  }

  private releaseKey(key = this.pressedKey): void {
    if (!this.pressedKey || (key && this.pressedKey !== key)) return;

    const releasedKey = this.pressedKey;

    this.keyPressAbortController?.abort();
    this.keyPressAbortController = undefined;
    this.pressedKey = null;
    this.render();
    this.dispatchStepChange(
      createStepKeyChange(this.state, releasedKey, false),
    );
  }

  private watchPointerRelease(key: StepKey): void {
    this.keyPressAbortController?.abort();
    this.keyPressAbortController = new AbortController();

    window.addEventListener("pointerup", () => this.releaseKey(key), {
      once: true,
      signal: this.keyPressAbortController.signal,
    });
    window.addEventListener("pointercancel", () => this.releaseKey(key), {
      once: true,
      signal: this.keyPressAbortController.signal,
    });
  }

  private handleLoopPointerDown(
    event: PointerEvent,
    edge: "start" | "end",
  ): void {
    if (event.button !== 0) return;

    event.preventDefault();
    this.updateLoopEdgeFromClientX(edge, event.clientX);
    this.watchLoopDrag(edge);
  }

  private handleLoopHandleKeydown(
    event: KeyboardEvent,
    edge: "start" | "end",
  ): void {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const delta = event.key === "ArrowLeft" ? -1 : 1;
    const step =
      edge === "start"
        ? this.state.loop.start + delta
        : this.state.loop.end + delta;

    this.updateLoopEdge(edge, step);
  }

  private watchLoopDrag(edge: "start" | "end"): void {
    this.loopDragAbortController?.abort();
    this.loopDragAbortController = new AbortController();

    window.addEventListener(
      "pointermove",
      (event) => this.updateLoopEdgeFromClientX(edge, event.clientX),
      { signal: this.loopDragAbortController.signal },
    );
    window.addEventListener(
      "pointerup",
      () => {
        this.loopDragAbortController?.abort();
        this.loopDragAbortController = undefined;
      },
      { once: true, signal: this.loopDragAbortController.signal },
    );
    window.addEventListener(
      "pointercancel",
      () => {
        this.loopDragAbortController?.abort();
        this.loopDragAbortController = undefined;
      },
      { once: true, signal: this.loopDragAbortController.signal },
    );
  }

  private updateLoopEdgeFromClientX(
    edge: "start" | "end",
    clientX: number,
  ): void {
    const step = this.loopStepFromClientX(clientX);
    this.updateLoopEdge(edge, step);
  }

  private loopStepFromClientX(clientX: number): number {
    const ruler = this.querySelector<HTMLElement>(".step-sequencer__loop-ruler");
    const rect = ruler?.getBoundingClientRect();
    if (!rect || rect.width <= 0) {
      return this.state.loop.end;
    }

    const progress = (clientX - rect.left) / rect.width;
    return Math.min(
      stepStepCount,
      Math.max(1, Math.floor(progress * stepStepCount) + 1),
    );
  }

  private updateLoopEdge(edge: "start" | "end", step: number): void {
    const previousLoop = this.state.loop;
    const { change, state } =
      edge === "start"
        ? setStepLoopStart(this.state, step)
        : setStepLoopEnd(this.state, step);

    if (
      previousLoop.start === state.loop.start &&
      previousLoop.end === state.loop.end
    ) {
      return;
    }

    this.state = state;
    this.render();
    this.dispatchStepChange(change);
  }

  private handleNoteToggle(step: number, lane: number): void {
    const { change, state } = toggleStepNote(this.state, step, lane);

    this.state = state;
    this.render();
    this.dispatchStepChange(change);
  }

  private dispatchStepChange(detail: StepSequencerStateChange): void {
    this.dispatchEvent(
      new CustomEvent<StepSequencerStateChange>("step-change", {
        bubbles: true,
        composed: true,
        detail,
      }),
    );
  }
}

function gridDirectionValue(direction: GridDirection): string {
  if (direction === "left") return "-1";
  if (direction === "off") return "0";
  return "1";
}

function numberAttribute(element: Element, name: string): number | undefined {
  const value = element.getAttribute(name);
  if (value === null || value.trim() === "") return undefined;

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function jsonAttribute<T>(element: Element, name: string): T | undefined {
  const value = element.getAttribute(name);
  if (!value) return undefined;

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}
