import { defineElements, initUi, type StepKey } from "@patchbayhq/ui";

export const stepKeys: StepKey[] = [
  "C4",
  "C#4",
  "D4",
  "D#4",
  "E4",
  "F4",
  "F#4",
  "G4",
  "G#4",
];

export function ratio(value: number, min: number, max: number) {
  const range = max - min || 1;
  return Math.max(0, Math.min(1, (value - min) / range));
}

export function init(node: HTMLElement, _dependencies?: readonly unknown[]) {
  defineElements();
  initUi(node);

  return {
    update(_nextDependencies?: readonly unknown[]) {
      initUi(node);
    },
  };
}
