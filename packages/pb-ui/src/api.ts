import { z } from "zod";

const numeric = z.preprocess((value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : Number(trimmed);
  }
  return value;
}, z.number().finite());

const integer = numeric.pipe(z.number().int());

const booleanish = z.preprocess((value) => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (
      normalized === "" ||
      normalized === "true" ||
      normalized === "1" ||
      normalized === "on"
    ) {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "off") {
      return false;
    }
  }
  return value;
}, z.boolean());

const label = z.string().min(1);
const colorHex = z
  .string()
  .regex(/^#[\da-f]{6}$/i, "Expected a 6-digit hex color");
const normalizedLevel = numeric.pipe(z.number().min(0).max(1));

export const orientationSchema = z.enum(["vertical", "horizontal"]);
export const buttonModeSchema = z.enum(["momentary", "toggle"]);
export const arrowDirectionSchema = z.enum(["left", "up", "down", "right"]);
export const gridDirectionSchema = z.enum(["right", "left", "off"]);
export const stepKeySchema = z.enum([
  "C4",
  "C#4",
  "D4",
  "D#4",
  "E4",
  "F4",
  "F#4",
  "G4",
  "G#4",
]);
export const stepColorSchema = z.enum(["orange", "blue"]);
export const lineOrientationSchema = z.enum(["horizontal", "vertical"]);
export const numberFormatSchema = z.enum(["integer", "float"]);
export const dialModeSchema = z.enum(["unipolar", "bipolar"]);
export const dialDragAxisSchema = z.enum(["vertical", "horizontal"]);
export const controlAppearanceSchema = z.enum([
  "default",
  "primary",
  "subtle",
  "danger",
]);

export const sliderPropsSchema = z
  .object({
    label: label.default("Slider"),
    value: numeric.default(0),
    min: numeric.default(0),
    max: numeric.default(1),
    step: z
      .union([numeric.pipe(z.number().positive()), z.literal("any")])
      .default(0.01),
    orientation: orientationSchema.default("vertical"),
    modulation: numeric.optional(),
    disabled: booleanish.default(false),
  })
  .strict()
  .transform((props) => ({
    ...props,
    modulation: props.modulation ?? props.value,
  }));

export const dialPropsSchema = z
  .object({
    label: label.default("Dial"),
    value: numeric.default(0),
    min: numeric.default(0),
    max: numeric.default(1),
    step: z
      .union([numeric.pipe(z.number().positive()), z.literal("any")])
      .default(0.01),
    mode: dialModeSchema.default("unipolar"),
    dragAxis: dialDragAxisSchema.default("vertical"),
    disabled: booleanish.default(false),
  })
  .strict();

export const togglePropsSchema = z
  .object({
    label: label.default("Toggle"),
    checked: booleanish.default(false),
    appearance: controlAppearanceSchema.default("default"),
    disabled: booleanish.default(false),
  })
  .strict();

export const buttonPropsSchema = z
  .object({
    label: label.default("Button"),
    pressed: booleanish.default(false),
    mode: buttonModeSchema.default("momentary"),
    appearance: controlAppearanceSchema.default("default"),
    disabled: booleanish.default(false),
  })
  .strict();

export const textButtonPropsSchema = z
  .object({
    value: booleanish.default(false),
    labels: z
      .object({
        off: label.default("Off"),
        on: label.default("On"),
      })
      .strict()
      .default({ off: "Off", on: "On" }),
    icon: z.string().min(1).optional(),
    picture: z.string().min(1).optional(),
    pictureAlt: z.string().default(""),
    appearance: controlAppearanceSchema.default("default"),
    disabled: booleanish.default(false),
  })
  .strict();

export const labelPropsSchema = z
  .object({
    text: z.string().default(""),
    align: z.enum(["left", "center", "right"]).default("left"),
  })
  .strict();

export const tabItemSchema = z
  .object({
    value: label,
    label,
    disabled: booleanish.default(false),
  })
  .strict();

export const tabsPropsSchema = z
  .object({
    value: label,
    items: z.array(tabItemSchema).min(1),
    disabled: booleanish.default(false),
  })
  .strict();

export const menuItemSchema = z
  .object({
    value: label,
    label,
    disabled: booleanish.default(false),
  })
  .strict();

export const menuPropsSchema = z
  .object({
    value: label,
    items: z.array(menuItemSchema).min(1),
    disabled: booleanish.default(false),
  })
  .strict();

export const arrowsPropsSchema = z
  .object({
    value: arrowDirectionSchema.default("right"),
    disabled: booleanish.default(false),
  })
  .strict();

export const dropPropsSchema = z
  .object({
    label: label.default("Drop Something Here!"),
    accept: z
      .union([z.string().min(1), z.array(z.string().min(1)).min(1)])
      .optional(),
    multiple: booleanish.default(false),
    disabled: booleanish.default(false),
  })
  .strict();

export const linePropsSchema = z
  .object({
    orientation: lineOrientationSchema.default("horizontal"),
    length: numeric.pipe(z.number().positive()).default(170),
    thickness: numeric.pipe(z.number().positive()).default(7),
  })
  .strict();

export const numberBoxPropsSchema = z
  .object({
    label: label.default("Number"),
    value: numeric.default(0),
    min: numeric.default(0),
    max: numeric.default(127),
    step: numeric.pipe(z.number().positive()).default(1),
    format: numberFormatSchema.default("integer"),
    disabled: booleanish.default(false),
  })
  .strict();

export const gridCellSchema = z
  .object({
    active: booleanish.default(false),
    y: normalizedLevel.default(0.5),
    color: stepColorSchema.default("blue"),
  })
  .strict();

const defaultGridColumnCount = 16;

const defaultGridCell = () => ({
  active: false,
  y: 0.5,
  color: "blue" as const,
});

export const gridPropsSchema = z
  .object({
    cells: z.array(gridCellSchema).min(1).optional(),
    directions: z.array(gridDirectionSchema).min(1).optional(),
    measureSize: integer.pipe(z.number().positive()).default(4),
  })
  .strict()
  .transform((props) => {
    const columnCount = Math.max(
      props.cells?.length ?? 0,
      props.directions?.length ?? 0,
      defaultGridColumnCount,
    );

    return {
      cells: Array.from(
        { length: columnCount },
        (_, index) => props.cells?.[index] ?? defaultGridCell(),
      ),
      directions: Array.from(
        { length: columnCount },
        (_, index) => props.directions?.[index] ?? "right",
      ),
      measureSize: props.measureSize,
    };
  });

export const stepNoteSchema = z
  .object({
    step: integer.pipe(z.number().min(1).max(16)),
    lane: integer.pipe(z.number().min(1).max(8)),
    velocity: normalizedLevel.default(1),
    duration: numeric.pipe(z.number().positive()).default(1),
  })
  .strict();

export const stepLoopSchema = z
  .object({
    start: integer.pipe(z.number().min(1).max(16)).default(1),
    end: integer.pipe(z.number().min(1).max(16)).default(16),
  })
  .strict()
  .refine((loop) => loop.end >= loop.start, {
    message: "Loop end must be greater than or equal to loop start",
    path: ["end"],
  });

export const stepSequencerPropsSchema = z
  .object({
    activeKey: stepKeySchema.default("C4"),
    notes: z.array(stepNoteSchema).default(() => []),
    loop: stepLoopSchema.default({ start: 1, end: 16 }),
    bars: integer.pipe(z.number().min(1).max(4)).default(4),
  })
  .strict();

export const envelopeShapeSchema = z
  .object({
    attack: normalizedLevel.default(0.2),
    decay: normalizedLevel.default(0.3),
    sustain: normalizedLevel.default(0.7),
    release: normalizedLevel.default(0.35),
  })
  .strict();

export const envelopePropsSchema = z
  .object({
    envelope: envelopeShapeSchema.default({
      attack: 0.2,
      decay: 0.3,
      sustain: 0.7,
      release: 0.35,
    }),
    disabled: booleanish.default(false),
  })
  .strict();

export const scopePropsSchema = z
  .object({
    samples: z.array(numeric).default(() => []),
    mode: z.enum(["waveform", "lissajous"]).default("waveform"),
    frozen: booleanish.default(false),
  })
  .strict();

export const meterPropsSchema = z
  .object({
    level: normalizedLevel.default(0),
    peak: normalizedLevel.optional(),
    orientation: orientationSchema.default("vertical"),
  })
  .strict()
  .transform((props) => ({ ...props, peak: props.peak ?? props.level }));

export const gainPropsSchema = z
  .object({
    valueDb: numeric.default(-12),
    minDb: numeric.default(-70),
    maxDb: numeric.default(6),
    stepDb: numeric.pipe(z.number().positive()).default(0.1),
    level: normalizedLevel.default(0),
    thumbSide: z.enum(["left", "right"]).default("right"),
    disabled: booleanish.default(false),
  })
  .strict();

export const colorSwatchesPropsSchema = z
  .object({
    swatches: z
      .array(colorHex)
      .min(1)
      .default(["#6dd7ff", "#a5a5a5", "#282828", "#f0c14f"]),
    value: colorHex.optional(),
  })
  .strict()
  .transform((props) => ({
    ...props,
    value: props.value ?? props.swatches[0],
  }));

export const componentSchemas = {
  "slider": sliderPropsSchema,
  "dial": dialPropsSchema,
  "toggle": togglePropsSchema,
  "button": buttonPropsSchema,
  "text-button": textButtonPropsSchema,
  "label": labelPropsSchema,
  "tabs": tabsPropsSchema,
  "menu": menuPropsSchema,
  "arrows": arrowsPropsSchema,
  "drop": dropPropsSchema,
  "line": linePropsSchema,
  "number-box": numberBoxPropsSchema,
  "grid": gridPropsSchema,
  "step-sequencer": stepSequencerPropsSchema,
  "envelope": envelopePropsSchema,
  "scope": scopePropsSchema,
  "meter": meterPropsSchema,
  "gain": gainPropsSchema,
  "color-swatches": colorSwatchesPropsSchema,
} as const;

export type Orientation = z.infer<typeof orientationSchema>;
export type ButtonMode = z.infer<typeof buttonModeSchema>;
export type ArrowDirection = z.infer<typeof arrowDirectionSchema>;
export type GridDirection = z.infer<typeof gridDirectionSchema>;
export type StepKey = z.infer<typeof stepKeySchema>;
export type StepColor = z.infer<typeof stepColorSchema>;
export type LineOrientation = z.infer<typeof lineOrientationSchema>;
export type NumberFormat = z.infer<typeof numberFormatSchema>;
export type DialMode = z.infer<typeof dialModeSchema>;
export type DialDragAxis = z.infer<typeof dialDragAxisSchema>;
export type ControlAppearance = z.infer<typeof controlAppearanceSchema>;

export type SliderProps = z.infer<typeof sliderPropsSchema>;
export type DialProps = z.infer<typeof dialPropsSchema>;
export type ToggleProps = z.infer<typeof togglePropsSchema>;
export type ButtonProps = z.infer<typeof buttonPropsSchema>;
export type TextButtonProps = z.infer<typeof textButtonPropsSchema>;
export type LabelProps = z.infer<typeof labelPropsSchema>;
export type TabItem = z.infer<typeof tabItemSchema>;
export type TabsProps = z.infer<typeof tabsPropsSchema>;
export type MenuItem = z.infer<typeof menuItemSchema>;
export type MenuProps = z.infer<typeof menuPropsSchema>;
export type ArrowsProps = z.infer<typeof arrowsPropsSchema>;
export type DropProps = z.infer<typeof dropPropsSchema>;
export type LineProps = z.infer<typeof linePropsSchema>;
export type NumberBoxProps = z.infer<typeof numberBoxPropsSchema>;
export type GridCell = z.infer<typeof gridCellSchema>;
export type GridProps = z.infer<typeof gridPropsSchema>;
export type StepNote = z.infer<typeof stepNoteSchema>;
export type StepLoop = z.infer<typeof stepLoopSchema>;
export type StepSequencerProps = z.infer<typeof stepSequencerPropsSchema>;
export type EnvelopeShape = z.infer<typeof envelopeShapeSchema>;
export type EnvelopeProps = z.infer<typeof envelopePropsSchema>;
export type ScopeProps = z.infer<typeof scopePropsSchema>;
export type MeterProps = z.infer<typeof meterPropsSchema>;
export type GainProps = z.infer<typeof gainPropsSchema>;
export type ColorSwatchesProps = z.infer<typeof colorSwatchesPropsSchema>;

export type ComponentName = keyof typeof componentSchemas;
export type ComponentPropsByName = {
  [Name in ComponentName]: z.infer<(typeof componentSchemas)[Name]>;
};

export const valueChangeSourceSchema = z.enum(["user", "program"]);
export const sliderChangeDetailSchema = z
  .object({
    value: numeric,
    ratio: normalizedLevel,
    source: valueChangeSourceSchema.default("user"),
  })
  .strict();
export const gridChangeDetailSchema = z.discriminatedUnion("type", [
  z
    .object({
      active: booleanish,
      cells: z.array(gridCellSchema).min(1),
      directions: z.array(gridDirectionSchema).min(1),
      index: integer.pipe(z.number().min(1)),
      type: z.literal("cell"),
      y: normalizedLevel,
    })
    .strict(),
  z
    .object({
      cells: z.array(gridCellSchema).min(1),
      direction: gridDirectionSchema,
      directions: z.array(gridDirectionSchema).min(1),
      index: integer.pipe(z.number().min(1)),
      type: z.literal("direction"),
    })
    .strict(),
]);
export const stepChangeDetailSchema = z.discriminatedUnion("type", [
  z
    .object({
      activeKey: stepKeySchema,
      bars: integer.pipe(z.number().min(1).max(4)),
      key: stepKeySchema,
      loop: stepLoopSchema,
      notes: z.array(stepNoteSchema),
      phase: z.enum(["press", "release"]),
      pressed: booleanish,
      type: z.literal("key"),
    })
    .strict(),
  z
    .object({
      active: booleanish,
      activeKey: stepKeySchema,
      bars: integer.pipe(z.number().min(1).max(4)),
      lane: integer.pipe(z.number().min(1).max(8)),
      loop: stepLoopSchema,
      notes: z.array(stepNoteSchema),
      step: integer.pipe(z.number().min(1).max(16)),
      type: z.literal("cell"),
    })
    .strict(),
  z
    .object({
      activeKey: stepKeySchema,
      bars: integer.pipe(z.number().min(1).max(4)),
      loop: stepLoopSchema,
      notes: z.array(stepNoteSchema),
      type: z.literal("loop"),
    })
    .strict(),
]);

export const componentErrorCodeSchema = z.enum([
  "invalid-props",
  "missing-control",
  "render-error",
]);
export const componentErrorDetailSchema = z
  .object({
    component: z.string().min(1),
    code: componentErrorCodeSchema,
    message: z.string().min(1),
    issues: z.array(z.string().min(1)).default(() => []),
  })
  .strict();

export type ValueChangeSource = z.infer<typeof valueChangeSourceSchema>;
export type SliderChangeDetail = z.infer<typeof sliderChangeDetailSchema>;
export type GridChangeDetail = z.infer<typeof gridChangeDetailSchema>;
export type StepChangeDetail = z.infer<typeof stepChangeDetailSchema>;
export type ComponentErrorCode = z.infer<typeof componentErrorCodeSchema>;
export type ComponentErrorDetail = z.infer<
  typeof componentErrorDetailSchema
>;

export type EventMap = {
  "slider-change": SliderChangeDetail;
  "grid-change": GridChangeDetail;
  "step-change": StepChangeDetail;
  "component-error": ComponentErrorDetail;
};

export type SafeParseResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: z.ZodError };

export function findEnabledMenuItemIndex(
  items: readonly Pick<MenuItem, "disabled">[],
  startIndex: number,
  direction: 1 | -1,
  fallbackIndex: number,
): number {
  for (let offset = 0; offset < items.length; offset += 1) {
    const index =
      (startIndex + offset * direction + items.length) % items.length;
    if (!items[index]?.disabled) return index;
  }

  return fallbackIndex;
}

export function parseSliderProps(input: unknown): SliderProps {
  return sliderPropsSchema.parse(input);
}

export function parseComponentProps<Name extends ComponentName>(
  name: Name,
  input: unknown,
): ComponentPropsByName[Name] {
  return componentSchemas[name].parse(input) as ComponentPropsByName[Name];
}

export function safeParseComponentProps<Name extends ComponentName>(
  name: Name,
  input: unknown,
): SafeParseResult<ComponentPropsByName[Name]> {
  return componentSchemas[name].safeParse(input) as SafeParseResult<
    ComponentPropsByName[Name]
  >;
}

export function createComponentErrorDetail(
  input: z.input<typeof componentErrorDetailSchema>,
): ComponentErrorDetail {
  return componentErrorDetailSchema.parse(input);
}

export function formatZodIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}
