import { writable } from "svelte/store";

import { codeVariantIds, type CodeVariantId } from "./code-variants";

const storageKey = "patchbay-ui-docs-code-variant";
const defaultVariant: CodeVariantId = "js";

function isCodeVariantId(value: unknown): value is CodeVariantId {
  return (
    typeof value === "string" && codeVariantIds.includes(value as CodeVariantId)
  );
}

function initialVariant() {
  if (typeof window === "undefined") {
    return defaultVariant;
  }

  const stored = window.localStorage.getItem(storageKey);
  return isCodeVariantId(stored) ? stored : defaultVariant;
}

export const activeCodeVariant = writable<CodeVariantId>(initialVariant());

export function setCodeVariant(variant: CodeVariantId) {
  activeCodeVariant.set(variant);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, variant);
    document.documentElement.dataset.codeVariant = variant;
  }
}
