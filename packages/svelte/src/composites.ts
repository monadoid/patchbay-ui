import type {
  DialProps,
  StepChangeDetail,
  StepKey,
  StepLoop,
  StepNote,
} from "@patchbay/ui";

export type StatusTone = "idle" | "active" | "warning" | "danger";

export type MacroRackMacro = {
  disabled?: boolean;
  id: string;
  label: string;
  max?: number;
  min?: number;
  mode?: DialProps["mode"];
  step?: DialProps["step"];
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

export type ClipStepLauncherChange = StepChangeDetail;
export type ClipStepLauncherKey = StepKey;
export type ClipStepLauncherLoop = StepLoop;
export type ClipStepLauncherNote = StepNote;
