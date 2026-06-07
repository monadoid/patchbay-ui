import { describe, expect, test } from "vitest";
import {
  gridPropsSchema,
  createComponentErrorDetail,
  formatZodIssues,
  sliderPropsSchema,
  stepSequencerPropsSchema,
  parseComponentProps,
  parseSliderProps,
  safeParseComponentProps,
} from "./api";

describe("pb-ui public API schemas", () => {
  test("slider props parse HTML-style attributes into normalized values", () => {
    expect(
      parseSliderProps({
        label: "Macro",
        value: "0.42",
        min: "0",
        max: "1",
        step: "0.01",
        orientation: "horizontal",
        disabled: "false",
      }),
    ).toEqual({
      label: "Macro",
      value: 0.42,
      min: 0,
      max: 1,
      step: 0.01,
      orientation: "horizontal",
      modulation: 0.42,
      disabled: false,
    });
  });

  test("schemas reject unknown keys and invalid unions", () => {
    expect(() =>
      sliderPropsSchema.parse({ value: 0, surprise: true }),
    ).toThrow();
    expect(() =>
      sliderPropsSchema.parse({ orientation: "diagonal" }),
    ).toThrow();
  });

  test("grid defaults are complete and direction unions are strict", () => {
    const grid = gridPropsSchema.parse({});

    expect(grid.cells).toHaveLength(16);
    expect(grid.directions).toHaveLength(16);
    expect(grid.directions.every((direction) => direction === "right")).toBe(
      true,
    );
    expect(() =>
      gridPropsSchema.parse({
        directions: Array.from({ length: 16 }, () => "up"),
      }),
    ).toThrow();
  });

  test("grid accepts wider layouts and normalizes missing directions", () => {
    const grid = gridPropsSchema.parse({
      cells: Array.from({ length: 24 }, (_, index) => ({
        active: index % 3 === 0,
        y: 0.5,
        color: "blue",
      })),
    });

    expect(grid.cells).toHaveLength(24);
    expect(grid.directions).toHaveLength(24);
    expect(grid.directions.every((direction) => direction === "right")).toBe(
      true,
    );
  });

  test("step loop parser enforces ordered loop ranges", () => {
    expect(stepSequencerPropsSchema.parse({}).loop).toEqual({ start: 1, end: 16 });
    expect(
      stepSequencerPropsSchema.parse({ activeKey: "D#4", loop: { start: 5, end: 8 } })
        .loop,
    ).toEqual({
      start: 5,
      end: 8,
    });
    expect(() =>
      stepSequencerPropsSchema.parse({ loop: { start: 9, end: 4 } }),
    ).toThrow();
  });

  test("generic component parser preserves component-specific output", () => {
    const slider = parseComponentProps("slider", { value: "0.5" });
    const gain = parseComponentProps("gain", {
      valueDb: "-6",
      level: "0.25",
    });

    expect(slider.value).toBe(0.5);
    expect(slider.modulation).toBe(0.5);
    expect(gain.valueDb).toBe(-6);
    expect(gain.level).toBe(0.25);
    expect(gain.thumbSide).toBe("right");
    expect(parseComponentProps("gain", { thumbSide: "left" }).thumbSide).toBe("left");
    expect(parseComponentProps("dial", {}).dragAxis).toBe("vertical");
    expect(parseComponentProps("dial", { dragAxis: "horizontal" }).dragAxis).toBe("horizontal");
  });

  test("safe parser returns structured failures without throwing", () => {
    const result = safeParseComponentProps("arrows", { value: "north" });

    expect(result.success).toBe(false);
  });

  test("component errors are typed and expose concise parse issues", () => {
    const result = safeParseComponentProps("slider", {
      orientation: "diagonal",
    });
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(formatZodIssues(result.error)).toEqual(
        expect.arrayContaining([expect.stringContaining("orientation")]),
      );
    }

    expect(
      createComponentErrorDetail({
        component: "slider",
        code: "invalid-props",
        message: "Invalid slider attributes",
        issues: ["orientation: Invalid option"],
      }),
    ).toEqual({
      component: "slider",
      code: "invalid-props",
      message: "Invalid slider attributes",
      issues: ["orientation: Invalid option"],
    });
  });
});
