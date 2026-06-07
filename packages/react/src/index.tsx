import {
  defineElements,
  initUi,
  parseComponentProps,
} from "@patchbayhq/ui";
import type * as Patchbay from "@patchbayhq/ui";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  type DetailedHTMLProps,
  type HTMLAttributes,
  type ReactNode,
} from "react";

export type ArrowDirection = Patchbay.ArrowDirection;
export type EnvelopeShape = Patchbay.EnvelopeShape;
export type GridCell = Patchbay.GridCell;
export type GridDirection = Patchbay.GridDirection;
export type GridChangeDetail = Patchbay.GridChangeDetail;
export type StepChangeDetail = Patchbay.StepChangeDetail;
export type StepKey = Patchbay.StepKey;
export type StepLoop = Patchbay.StepLoop;
export type StepNote = Patchbay.StepNote;
export type MenuItem = Patchbay.MenuItem;
export type TabItem = Patchbay.TabItem;
export type ControlAppearance = Patchbay.ControlAppearance;

export type SliderControlProps = Patchbay.SliderProps;
export type DialControlProps = Patchbay.DialProps;
export type DialDragAxis = Patchbay.DialDragAxis;
export type ToggleControlProps = Patchbay.ToggleProps;
export type ButtonControlProps = Patchbay.ButtonProps;
export type TextButtonControlProps = Patchbay.TextButtonProps;
export type LabelControlProps = Patchbay.LabelProps;
export type TabsControlProps = Patchbay.TabsProps;
export type MenuControlProps = Patchbay.MenuProps;
export type ArrowsControlProps = Patchbay.ArrowsProps;
export type DropControlProps = Patchbay.DropProps;
export type LineControlProps = Patchbay.LineProps;
export type NumberBoxControlProps = Patchbay.NumberBoxProps;
export type GridControlProps = Patchbay.GridProps;
export type StepSequencerControlProps = Patchbay.StepSequencerProps;
export type EnvelopeControlProps = Patchbay.EnvelopeProps;
export type ScopeControlProps = Patchbay.ScopeProps;
export type MeterControlProps = Patchbay.MeterProps;
export type GainControlProps = Patchbay.GainProps;
export type ColorSwatchesControlProps = Patchbay.ColorSwatchesProps;

type CommonProps = {
  className?: string;
};

type CssVars = CSSProperties & Record<`--${string}`, string | number>;
type GridDomElement = HTMLElement & {
  cells: Patchbay.GridCell[];
  directions: Patchbay.GridDirection[];
  measureSize: number;
};
type StepDomElement = HTMLElement & {
  activeKey: Patchbay.StepKey;
  bars: number;
  loop: Patchbay.StepSequencerProps["loop"];
  notes: Patchbay.StepNote[];
};
export type PatchbayElementProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "sequencer-grid": PatchbayElementProps;
      "step-sequencer": PatchbayElementProps;
    }
  }
}

function cx(...classes: Array<false | null | string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function ratio(value: number, min: number, max: number) {
  const range = max - min || 1;
  return Math.max(0, Math.min(1, (value - min) / range));
}

function useControlInit<T extends HTMLElement>(dependencies: readonly unknown[]) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;

    defineElements();
    initUi(ref.current);
  }, dependencies);

  return ref;
}

function numberFromInput(event: ChangeEvent<HTMLInputElement>) {
  return event.currentTarget.valueAsNumber;
}

export type SliderProps = CommonProps &
  Partial<Patchbay.SliderProps> & {
    onValueChange?: (value: number) => void;
  };

export function Slider({
  className,
  onValueChange,
  ...inputProps
}: SliderProps) {
  const props = parseComponentProps("slider", inputProps);
  const fieldId = useId();
  const ref = useControlInit<HTMLSpanElement>([
    props.disabled,
    props.max,
    props.min,
    props.modulation,
    props.orientation,
    props.step,
    props.value,
  ]);

  return (
    <label className={cx("field", className)} htmlFor={fieldId}>
      <span className="field__label">{props.label}</span>
      <span
        className="slider"
        data-modulation={props.modulation}
        data-slider
        data-orientation={props.orientation}
        ref={ref}
      >
        <input
          aria-label={props.label}
          disabled={props.disabled}
          id={fieldId}
          max={props.max}
          min={props.min}
          onChange={(event) => onValueChange?.(numberFromInput(event))}
          step={props.step}
          type="range"
          value={props.value}
        />
      </span>
    </label>
  );
}

export type DialProps = CommonProps &
  Partial<Patchbay.DialProps> & {
    onValueChange?: (value: number) => void;
  };

export function Dial({
  className,
  onValueChange,
  ...inputProps
}: DialProps) {
  const props = parseComponentProps("dial", inputProps);
  const fieldId = useId();
  const ref = useControlInit<HTMLSpanElement>([
    props.disabled,
    props.dragAxis,
    props.max,
    props.min,
    props.step,
    props.value,
  ]);
  const valueRatio = ratio(props.value, props.min, props.max);

  return (
    <label className={cx("field", className)} htmlFor={fieldId}>
      <span className="field__label">{props.label}</span>
      <span
        className="dial"
        data-dial
        data-drag-axis={props.dragAxis}
        ref={ref}
        style={{ "--dial-value": valueRatio } as CssVars}
      >
        <input
          aria-label={props.label}
          disabled={props.disabled}
          id={fieldId}
          max={props.max}
          min={props.min}
          onChange={(event) => onValueChange?.(numberFromInput(event))}
          step={props.step}
          type="range"
          value={props.value}
        />
      </span>
    </label>
  );
}

export type ToggleProps = CommonProps &
  Partial<Patchbay.ToggleProps> & {
    onCheckedChange?: (checked: boolean) => void;
  };

export function Toggle({
  className,
  onCheckedChange,
  ...inputProps
}: ToggleProps) {
  const props = parseComponentProps("toggle", inputProps);

  return (
    <label
      className={cx("toggle", className)}
      data-appearance={props.appearance}
    >
      <input
        aria-label={props.label}
        checked={props.checked}
        disabled={props.disabled}
        onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
        type="checkbox"
      />
      <span aria-hidden="true" />
    </label>
  );
}

export type ButtonProps = CommonProps &
  Partial<Patchbay.ButtonProps> & {
    onPressedChange?: (pressed: boolean) => void;
  };

export function Button({
  className,
  onPressedChange,
  ...inputProps
}: ButtonProps) {
  const props = parseComponentProps("button", inputProps);

  function setPressed(pressed: boolean) {
    if (!props.disabled) onPressedChange?.(pressed);
  }

  return (
    <button
      aria-label={props.label}
      aria-pressed={props.pressed}
      className={cx("button", props.pressed && "is-active", className)}
      data-appearance={props.appearance}
      disabled={props.disabled}
      onClick={() => {
        if (props.mode === "toggle") setPressed(!props.pressed);
      }}
      onPointerDown={() => {
        if (props.mode === "momentary") setPressed(true);
      }}
      onPointerLeave={() => {
        if (props.mode === "momentary") setPressed(false);
      }}
      onPointerUp={() => {
        if (props.mode === "momentary") setPressed(false);
      }}
      type="button"
    />
  );
}

export type TextButtonProps = CommonProps &
  Omit<Partial<Patchbay.TextButtonProps>, "icon"> & {
    icon?: ReactNode;
    onValueChange?: (value: boolean) => void;
  };

export function TextButton({
  className,
  onValueChange,
  ...inputProps
}: TextButtonProps) {
  const props = parseComponentProps("text-button", {
    ...inputProps,
    icon: typeof inputProps.icon === "string" ? inputProps.icon : undefined,
  });
  const label = props.value ? props.labels.on : props.labels.off;
  const icon = inputProps.icon ?? props.icon;

  return (
    <button
      aria-pressed={props.value}
      className={cx("text-button", className)}
      data-appearance={props.appearance}
      disabled={props.disabled}
      onClick={() => onValueChange?.(!props.value)}
      type="button"
    >
      {props.picture ? (
        <img
          alt={props.pictureAlt}
          className="text-button__picture"
          src={props.picture}
        />
      ) : icon ? (
        <span aria-hidden="true" className="text-button__icon">
          {icon}
        </span>
      ) : null}
      <span className="text-button__label">{label}</span>
    </button>
  );
}

export type LabelProps = CommonProps & Partial<Patchbay.LabelProps>;

export function Label({ className, ...inputProps }: LabelProps) {
  const props = parseComponentProps("label", inputProps);

  return (
    <p
      className={cx("label", className)}
      style={{ textAlign: props.align }}
    >
      {props.text}
    </p>
  );
}

export type TabsProps = CommonProps &
  Partial<Patchbay.TabsProps> & {
    onValueChange?: (value: string) => void;
  };

export function Tabs({
  className,
  onValueChange,
  ...inputProps
}: TabsProps) {
  const props = parseComponentProps("tabs", inputProps);

  return (
    <div className={cx("tabs", className)} role="tablist">
      {props.items.map((item) => {
        const active = item.value === props.value;

        return (
          <button
            aria-selected={active}
            className={cx("tab", active && "is-active")}
            disabled={props.disabled || item.disabled}
            key={item.value}
            onClick={() => onValueChange?.(item.value)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export type MenuProps = CommonProps &
  Partial<Patchbay.MenuProps> & {
    onValueChange?: (value: string) => void;
  };

export function Menu({
  className,
  onValueChange,
  ...inputProps
}: MenuProps) {
  const props = parseComponentProps("menu", inputProps);
  const buttonId = useId();
  const listboxId = useId();
  const selectedIndex = Math.max(
    0,
    props.items.findIndex((item) => item.value === props.value),
  );
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const selected = props.items[selectedIndex] ?? props.items[0];

  function firstEnabledIndex(startIndex: number, direction: 1 | -1) {
    for (let offset = 0; offset < props.items.length; offset += 1) {
      const index =
        (startIndex + offset * direction + props.items.length) %
        props.items.length;
      if (!props.items[index]?.disabled) return index;
    }
    return selectedIndex;
  }

  function commit(index: number) {
    const item = props.items[index];
    if (!item || item.disabled) return;

    onValueChange?.(item.value);
    setActiveIndex(index);
    setOpen(false);
  }

  return (
    <div
      className={cx("menu", className)}
      data-open={open ? "true" : undefined}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={buttonId}
        className="menu__button"
        disabled={props.disabled}
        id={buttonId}
        onClick={() => {
          setActiveIndex(selectedIndex);
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const direction = event.key === "ArrowDown" ? 1 : -1;
            const nextIndex = firstEnabledIndex(
              activeIndex + direction,
              direction,
            );
            setActiveIndex(nextIndex);
            setOpen(true);
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (open) {
              commit(activeIndex);
            } else {
              setOpen(true);
            }
            return;
          }
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        type="button"
      >
        <span className="menu__value">{selected?.label ?? "Select"}</span>
        <span aria-hidden="true" className="menu__chevron" />
      </button>
      {open ? (
        <div
          aria-activedescendant={`${listboxId}-${activeIndex}`}
          className="menu__list"
          id={listboxId}
          role="listbox"
          tabIndex={-1}
        >
          {props.items.map((item, index) => {
            const selectedOption = item.value === props.value;
            const active = index === activeIndex;

            return (
              <button
                aria-disabled={item.disabled || undefined}
                aria-selected={selectedOption}
                className={cx(
                  "menu__option",
                  active && "is-active",
                  selectedOption && "is-selected",
                )}
                disabled={item.disabled}
                id={`${listboxId}-${index}`}
                key={item.value}
                onClick={() => commit(index)}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
                type="button"
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export type ArrowsProps = CommonProps &
  Partial<Patchbay.ArrowsProps> & {
    onValueChange?: (value: Patchbay.ArrowDirection) => void;
  };

export function Arrows({
  className,
  onValueChange,
  ...inputProps
}: ArrowsProps) {
  const props = parseComponentProps("arrows", inputProps);

  return (
    <div className={cx("arrows", className)} role="group">
      <button
        aria-label="Left"
        aria-pressed={props.value === "left"}
        disabled={props.disabled}
        onClick={() => onValueChange?.("left")}
        type="button"
      />
      <button
        aria-label="Right"
        aria-pressed={props.value === "right"}
        disabled={props.disabled}
        onClick={() => onValueChange?.("right")}
        type="button"
      />
    </div>
  );
}

export type DropProps = CommonProps &
  Partial<Patchbay.DropProps> & {
    onFilesChange?: (files: FileList) => void;
  };

export function Drop({
  className,
  onFilesChange,
  ...inputProps
}: DropProps) {
  const props = parseComponentProps("drop", inputProps);
  const accept = Array.isArray(props.accept)
    ? props.accept.join(",")
    : props.accept;

  return (
    <label className={cx("drop", className)} title={props.label}>
      <input
        accept={accept}
        aria-label={props.label}
        disabled={props.disabled}
        multiple={props.multiple}
        onChange={(event) => {
          if (event.currentTarget.files)
            onFilesChange?.(event.currentTarget.files);
        }}
        type="file"
      />
      <span aria-hidden="true" />
    </label>
  );
}

export type LineProps = CommonProps & Partial<Patchbay.LineProps>;

export function Line({ className, ...inputProps }: LineProps) {
  const props = parseComponentProps("line", inputProps);
  const style =
    props.orientation === "vertical"
      ? ({
          blockSize: props.length,
          inlineSize: props.thickness,
        } satisfies CSSProperties)
      : ({
          blockSize: props.thickness,
          inlineSize: props.length,
        } satisfies CSSProperties);

  return (
    <span
      aria-hidden="true"
      className={cx(
        "line",
        props.orientation === "vertical" && "line--vertical",
        className,
      )}
      style={style}
    />
  );
}

export type NumberBoxProps = CommonProps &
  Partial<Patchbay.NumberBoxProps> & {
    onValueChange?: (value: number) => void;
  };

export function NumberBox({
  className,
  onValueChange,
  ...inputProps
}: NumberBoxProps) {
  const props = parseComponentProps("number-box", inputProps);

  return (
    <input
      aria-label={props.label}
      className={cx("number-box", className)}
      disabled={props.disabled}
      max={props.max}
      min={props.min}
      onChange={(event) => onValueChange?.(numberFromInput(event))}
      step={props.step}
      type="number"
      value={props.value}
    />
  );
}

export type GridProps = CommonProps &
  Partial<Patchbay.GridProps> & {
    onCellsChange?: (cells: Patchbay.GridCell[]) => void;
    onDirectionsChange?: (directions: Patchbay.GridDirection[]) => void;
  };

export function Grid({
  className,
  onCellsChange,
  onDirectionsChange,
  ...inputProps
}: GridProps) {
  const props = parseComponentProps("grid", inputProps);
  const ref = useRef<GridDomElement>(null);

  useEffect(() => {
    defineElements();
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.cells = props.cells;
    element.directions = props.directions;
    element.measureSize = props.measureSize;
  }, [props.cells, props.directions, props.measureSize]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    function handleChange(event: Event) {
      const detail = (event as CustomEvent<Patchbay.GridChangeDetail>).detail;
      onCellsChange?.(detail.cells);
      onDirectionsChange?.(detail.directions);
    }

    element.addEventListener("grid-change", handleChange);
    return () => element.removeEventListener("grid-change", handleChange);
  }, [onCellsChange, onDirectionsChange]);

  return <sequencer-grid className={className} ref={ref} />;
}

export type StepSequencerProps = CommonProps &
  Partial<Patchbay.StepSequencerProps> & {
    onChange?: (detail: Patchbay.StepChangeDetail) => void;
    onCellChange?: (
      change: Extract<Patchbay.StepChangeDetail, { type: "cell" }>,
    ) => void;
    onKeyChange?: (
      change: Extract<Patchbay.StepChangeDetail, { type: "key" }>,
    ) => void;
    onKeyPress?: (key: Patchbay.StepKey) => void;
    onKeyRelease?: (key: Patchbay.StepKey) => void;
    onLoopChange?: (loop: Patchbay.StepSequencerProps["loop"]) => void;
    onNotesChange?: (notes: Patchbay.StepNote[]) => void;
  };

export function StepSequencer({
  className,
  onChange,
  onCellChange,
  onKeyChange,
  onKeyPress,
  onKeyRelease,
  onLoopChange,
  onNotesChange,
  ...inputProps
}: StepSequencerProps) {
  const props = parseComponentProps("step-sequencer", inputProps);
  const ref = useRef<StepDomElement>(null);

  useEffect(() => {
    defineElements();
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.activeKey = props.activeKey;
    element.bars = props.bars;
    element.loop = props.loop;
    element.notes = props.notes;
  }, [props.activeKey, props.bars, props.loop, props.notes]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    function handleChange(event: Event) {
      const detail = (event as CustomEvent<Patchbay.StepChangeDetail>).detail;
      onChange?.(detail);
      if (detail.type === "key") {
        onKeyChange?.(detail);
        if (detail.pressed) {
          onKeyPress?.(detail.key);
        } else {
          onKeyRelease?.(detail.key);
        }
      }
      if (detail.type === "loop") {
        onLoopChange?.(detail.loop);
      }
      if (detail.type === "cell") {
        onCellChange?.(detail);
        onNotesChange?.(detail.notes);
      }
    }

    element.addEventListener("step-change", handleChange);
    return () => element.removeEventListener("step-change", handleChange);
  }, [
    onCellChange,
    onChange,
    onKeyChange,
    onKeyPress,
    onKeyRelease,
    onLoopChange,
    onNotesChange,
  ]);

  return <step-sequencer className={className} ref={ref} />;
}

export type EnvelopeProps = CommonProps &
  Partial<Patchbay.EnvelopeProps> & {
    onEnvelopeChange?: (envelope: Patchbay.EnvelopeShape) => void;
  };

export function Envelope({
  className,
  onEnvelopeChange,
  ...inputProps
}: EnvelopeProps) {
  const props = parseComponentProps("envelope", inputProps);
  const attackX = 8 + props.envelope.attack * 54;
  const decayX = attackX + props.envelope.decay * 70;
  const sustainY = 88 - props.envelope.sustain * 76;
  const releaseX = 194 - props.envelope.release * 40;
  const path = `M8 88 L8 12 L${attackX.toFixed(1)} 12 L${decayX.toFixed(1)} ${sustainY.toFixed(
    1,
  )} C${releaseX.toFixed(1)} ${sustainY.toFixed(1)} 172 75 194 88`;

  function setSustainFromClientY(clientY: number, svg: SVGSVGElement) {
    if (!onEnvelopeChange || props.disabled) return;
    const rect = svg.getBoundingClientRect();
    const sustain = Math.max(
      0,
      Math.min(1, 1 - (clientY - rect.top - 12) / 76),
    );

    onEnvelopeChange({ ...props.envelope, sustain });
  }

  function beginSustainDrag(event: ReactPointerEvent<SVGCircleElement>) {
    if (!onEnvelopeChange || props.disabled) return;
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;

    event.preventDefault();
    const pointerId = event.pointerId;
    const target = event.currentTarget;

    try {
      target.setPointerCapture(pointerId);
    } catch {
      // Some browser/SVG combinations skip capture after a quick pointer cancel.
    }

    setSustainFromClientY(event.clientY, svg);

    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;

      moveEvent.preventDefault();
      setSustainFromClientY(moveEvent.clientY, svg);
    };
    const handleEnd = (endEvent: globalThis.PointerEvent) => {
      if (endEvent.pointerId !== pointerId) return;

      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleEnd);
      window.removeEventListener("pointercancel", handleEnd);

      try {
        target.releasePointerCapture(pointerId);
      } catch {
        // Capture may already be released by the browser.
      }
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleEnd);
    window.addEventListener("pointercancel", handleEnd);
  }

  return (
    <div className={cx("envelope", className)}>
      <svg
        data-envelope
        role="img"
        aria-label="ADSR envelope"
        viewBox="0 0 210 96"
      >
        <path
          className="envelope__grid"
          d="M1 24H209M1 48H209M1 72H209M42 1V95M84 1V95M126 1V95M168 1V95"
        />
        <path className="envelope__curve" data-envelope-curve d={path} />
        <rect data-envelope-handle="start" height="8" width="8" x="4" y="84" />
        <rect
          data-envelope-handle="attack"
          height="8"
          width="8"
          x={attackX - 4}
          y="8"
        />
        <circle
          data-envelope-handle="decay"
          cx={decayX}
          cy={sustainY}
          onPointerDown={beginSustainDrag}
          r="4"
        />
        <circle
          data-envelope-handle="sustain"
          cx={releaseX}
          cy={sustainY}
          onPointerDown={beginSustainDrag}
          r="4"
        />
        <rect data-envelope-handle="end" height="8" width="8" x="190" y="84" />
      </svg>
    </div>
  );
}

export type ScopeProps = CommonProps & Partial<Patchbay.ScopeProps>;

export function Scope({ className, ...inputProps }: ScopeProps) {
  const props = parseComponentProps("scope", inputProps);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#161616";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(255, 255, 255, 0.12)";
    context.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 23) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }

    const samples =
      props.samples.length > 0
        ? props.samples
        : Array.from({ length: canvas.width }, () => 0);
    context.strokeStyle = "#9cd8ca";
    context.lineWidth = 2;
    context.beginPath();

    samples.forEach((sample, index) => {
      const x = (index / Math.max(1, samples.length - 1)) * canvas.width;
      const y =
        canvas.height / 2 -
        Math.max(-1, Math.min(1, sample)) * (canvas.height * 0.38);
      index === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
    });

    context.stroke();
  }, [props.samples]);

  return (
    <canvas
      aria-label="Scope"
      className={cx("scope", className)}
      data-scope
      height={98}
      ref={ref}
      width={184}
    />
  );
}

export type MeterProps = CommonProps & Partial<Patchbay.MeterProps>;

export function Meter({ className, ...inputProps }: MeterProps) {
  const props = parseComponentProps("meter", inputProps);

  return (
    <div
      aria-label="Signal meter"
      className={cx("meter", className)}
      data-meter
    >
      <span
        aria-hidden="true"
        className="meter__bar"
        data-meter-bar
        style={{ "--meter-value": props.level } as CssVars}
      />
    </div>
  );
}

export type GainProps = CommonProps &
  Partial<Patchbay.GainProps> & {
    onValueDbChange?: (valueDb: number) => void;
  };

export function Gain({
  className,
  onValueDbChange,
  ...inputProps
}: GainProps) {
  const props = parseComponentProps("gain", inputProps);
  const gainRatio = ratio(props.valueDb, props.minDb, props.maxDb);

  return (
    <label
      className={cx("gain", className)}
      data-gain
      data-thumb-side={props.thumbSide}
      style={
        {
          "--gain-signal": props.level,
          "--gain-value": gainRatio,
        } as CssVars
      }
    >
      <input
        aria-label="Gain"
        disabled={props.disabled}
        max={props.maxDb}
        min={props.minDb}
        onChange={(event) => onValueDbChange?.(numberFromInput(event))}
        step={props.stepDb}
        type="range"
        value={props.valueDb}
      />
      <span
        aria-hidden="true"
        className="gain__signal"
        data-gain-signal
      />
      <span aria-hidden="true" className="gain__thumb" />
      <span className="gain__readout" data-gain-readout>
        {props.valueDb.toFixed(1)} dB
      </span>
    </label>
  );
}

export type ColorSwatchesProps = CommonProps &
  Partial<Patchbay.ColorSwatchesProps> & {
    onValueChange?: (value: string) => void;
  };

export function ColorSwatches({
  className,
  onValueChange,
  ...inputProps
}: ColorSwatchesProps) {
  const props = parseComponentProps("color-swatches", inputProps);

  return (
    <div aria-label="Color swatches" className={cx("color-swatches", className)}>
      {props.swatches.map((swatch, index) => (
        <input
          aria-label={`Color ${index + 1}`}
          key={`${swatch}-${index}`}
          onChange={(event) => onValueChange?.(event.currentTarget.value)}
          type="color"
          value={props.value === swatch ? props.value : swatch}
        />
      ))}
    </div>
  );
}

export type StatusTone = "idle" | "active" | "warning" | "danger";

export type PanelProps = HTMLAttributes<HTMLElement> & {
  compact?: boolean;
};

export function Panel({ className, compact, ...props }: PanelProps) {
  return (
    <section
      {...props}
      className={cx("panel", compact && "panel--compact", className)}
    />
  );
}

export type PanelHeaderProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  actions?: ReactNode;
  eyebrow?: ReactNode;
  status?: ReactNode;
  subtitle?: ReactNode;
  title?: ReactNode;
};

export function PanelHeader({
  actions,
  children,
  className,
  eyebrow,
  status,
  subtitle,
  title,
  ...props
}: PanelHeaderProps) {
  const controls = (
    <>
      {status}
      {actions}
      {children}
    </>
  );

  return (
    <header {...props} className={cx("panel-header", className)}>
      <div className="panel-header__main">
        {eyebrow && <span className="panel-header__eyebrow">{eyebrow}</span>}
        {title && <h3 className="panel-header__title">{title}</h3>}
        {subtitle && <p className="panel-header__subtitle">{subtitle}</p>}
      </div>
      {(status || actions || children) && (
        <div className="panel-header__actions">{controls}</div>
      )}
    </header>
  );
}

export type PanelSectionProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  actions?: ReactNode;
  title?: ReactNode;
};

export function PanelSection({
  actions,
  children,
  className,
  title,
  ...props
}: PanelSectionProps) {
  return (
    <section {...props} className={cx("panel-section", className)}>
      {(title || actions) && (
        <div className="panel-section__header">
          {title && <h4 className="panel-section__title">{title}</h4>}
          {actions && <div className="panel-section__actions">{actions}</div>}
        </div>
      )}
      <div className="panel-section__body">{children}</div>
    </section>
  );
}

export type StatusIndicatorProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  label?: ReactNode;
  pulse?: boolean;
  tone?: StatusTone;
  value?: ReactNode;
};

export function StatusIndicator({
  className,
  label,
  pulse,
  tone = "idle",
  value,
  ...props
}: StatusIndicatorProps) {
  return (
    <span
      {...props}
      className={cx("status-indicator", className)}
      data-pulse={pulse ? "true" : undefined}
      data-tone={tone}
    >
      <span aria-hidden="true" className="status-indicator__dot" />
      {label && <span className="status-indicator__label">{label}</span>}
      {value && <strong className="status-indicator__value">{value}</strong>}
    </span>
  );
}

export type MacroRackMacro = {
  dragAxis?: Patchbay.DialProps["dragAxis"];
  disabled?: boolean;
  id: string;
  label: string;
  max?: number;
  min?: number;
  mode?: Patchbay.DialProps["mode"];
  step?: Patchbay.DialProps["step"];
  value: number;
};

export const defaultMacroRackMacros: MacroRackMacro[] = Array.from(
  { length: 8 },
  (_, index) => ({
    id: `macro-${index + 1}`,
    label: `Macro ${index + 1}`,
    value: 0,
  }),
);

export type MacroRackProps = CommonProps & {
  columns?: 2 | 3 | 4 | 8;
  disabled?: boolean;
  label?: string;
  macros?: readonly MacroRackMacro[];
  onMacroChange?: (
    id: string,
    value: number,
    macro: MacroRackMacro,
  ) => void;
};

export function MacroRack({
  className,
  columns = 4,
  disabled,
  label = "Macro rack",
  macros = defaultMacroRackMacros,
  onMacroChange,
}: MacroRackProps) {
  return (
    <div
      aria-label={label}
      className={cx("macro-rack", className)}
      role="group"
      style={{ "--macro-rack-columns": columns } as CssVars}
    >
      {macros.map((macro) => (
        <Dial
          className="macro-rack__control"
          disabled={disabled || macro.disabled}
          dragAxis={macro.dragAxis}
          key={macro.id}
          label={macro.label}
          max={macro.max}
          min={macro.min}
          mode={macro.mode}
          onValueChange={(value) => onMacroChange?.(macro.id, value, macro)}
          step={macro.step}
          value={macro.value}
        />
      ))}
    </div>
  );
}

export type ClipStepLauncherProps = CommonProps & {
  activeKey?: Patchbay.StepKey;
  bars?: number;
  children?: ReactNode;
  clipName?: ReactNode;
  disabled?: boolean;
  launchLabel?: string;
  loop?: Patchbay.StepLoop;
  notes?: Patchbay.StepNote[];
  onCellChange?: StepSequencerProps["onCellChange"];
  onChange?: StepSequencerProps["onChange"];
  onKeyChange?: StepSequencerProps["onKeyChange"];
  onKeyPress?: StepSequencerProps["onKeyPress"];
  onKeyRelease?: StepSequencerProps["onKeyRelease"];
  onLaunch?: () => void;
  onLoopChange?: StepSequencerProps["onLoopChange"];
  onNotesChange?: StepSequencerProps["onNotesChange"];
  onStop?: () => void;
  playing?: boolean;
  statusLabel?: ReactNode;
  statusTone?: StatusTone;
  stopLabel?: string;
  title?: ReactNode;
};

export function ClipStepLauncher({
  activeKey = "C4",
  bars = 4,
  children,
  className,
  clipName = "Pattern",
  disabled,
  launchLabel = "Launch",
  loop,
  notes,
  onCellChange,
  onChange,
  onKeyChange,
  onKeyPress,
  onKeyRelease,
  onLaunch,
  onLoopChange,
  onNotesChange,
  onStop,
  playing,
  statusLabel = "Clip",
  statusTone,
  stopLabel = "Stop",
  title = "Step launcher",
}: ClipStepLauncherProps) {
  const resolvedStatusTone = statusTone ?? (playing ? "active" : "idle");

  return (
    <Panel className={cx("clip-step-launcher", className)}>
      <PanelHeader
        status={
          <StatusIndicator
            label={statusLabel}
            pulse={playing}
            tone={resolvedStatusTone}
            value={playing ? "Playing" : "Ready"}
          />
        }
        subtitle={clipName}
        title={title}
      />
      <div className="clip-step-launcher__transport">
        <button
          className="text-button clip-step-launcher__launch"
          data-appearance="primary"
          disabled={disabled}
          onClick={onLaunch}
          type="button"
        >
          <span className="text-button__label">{launchLabel}</span>
        </button>
        <button
          className="text-button clip-step-launcher__stop"
          data-appearance="subtle"
          disabled={disabled}
          onClick={onStop}
          type="button"
        >
          <span className="text-button__label">{stopLabel}</span>
        </button>
      </div>
      <StepSequencer
        activeKey={activeKey}
        bars={bars}
        className="clip-step-launcher__steps"
        loop={loop}
        notes={notes}
        onCellChange={onCellChange}
        onChange={onChange}
        onKeyChange={onKeyChange}
        onKeyPress={onKeyPress}
        onKeyRelease={onKeyRelease}
        onLoopChange={onLoopChange}
        onNotesChange={onNotesChange}
      />
      {children && <div className="clip-step-launcher__extra">{children}</div>}
    </Panel>
  );
}
