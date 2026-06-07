export const codeVariantIds = ["js", "react", "svelte"] as const;

export type CodeVariantId = (typeof codeVariantIds)[number];

export const codeVariantLabels = {
  js: "Vanilla",
  react: "React",
  svelte: "Svelte",
} as const satisfies Record<CodeVariantId, string>;

export type CodeVariantSection = {
  code: string;
  description?: string;
  file?: string;
  language: string;
  title: string;
};

export type HighlightedCodeSection = CodeVariantSection & {
  highlighted: string;
};

export type CodeVariantSource = {
  code: string;
  id: CodeVariantId;
  label?: string;
  language: string;
  sections?: CodeVariantSection[];
};

export type HighlightedCodeVariant = CodeVariantSource & {
  highlighted: string;
  highlightedSections?: HighlightedCodeSection[];
  label: string;
};
