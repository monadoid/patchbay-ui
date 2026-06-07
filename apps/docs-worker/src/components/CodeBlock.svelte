<script lang="ts">
  import { onMount } from "svelte";
  import { codeToHtml, type ShikiTransformer } from "shiki";

  import CopyButton from "./CopyButton.svelte";
  import {
    codeVariantLabels,
    type CodeVariantSource,
    type HighlightedCodeVariant,
  } from "../lib/code-variants";
  import {
    activeCodeVariant,
    setCodeVariant,
  } from "../lib/code-variant-state";

  export let copyLabel: string | undefined = undefined;
  export let copySuccessLabel: string | undefined = undefined;
  export let className = "";
  export let title: string | undefined = undefined;
  export let variants: CodeVariantSource[];

  let highlightedVariants: HighlightedCodeVariant[] = [];

  type HighlightElement = {
    properties?: Record<string, unknown>;
    children?: unknown[];
  };

  function tintCommentLine(node: unknown) {
    if (!node || typeof node !== "object") {
      return;
    }

    const element = node as HighlightElement;
    const style =
      typeof element.properties?.style === "string"
        ? element.properties.style
        : "";

    element.properties = {
      ...element.properties,
      style: `${style}${style.endsWith(";") || style === "" ? "" : ";"}color:#6a737d!important;font-weight:400!important;`,
    };

    element.children?.forEach(tintCommentLine);
  }

  function setupCommentLineTransformer(code: string): ShikiTransformer {
    const commentLines = code.split(/\r?\n/).map((line) => line.startsWith("#"));

    return {
      name: "patchbay-setup-comment-lines",
      line(element, line) {
        if (!commentLines[line - 1]) {
          return;
        }

        tintCommentLine(element);
      },
    };
  }

  async function highlightVariant(
    variant: CodeVariantSource,
  ): Promise<HighlightedCodeVariant> {
    const highlightedSections = variant.sections
      ? await Promise.all(
          variant.sections.map(async (section) => ({
            ...section,
            highlighted: await codeToHtml(section.code, {
              lang: section.language,
              theme: "github-dark",
              transformers: [setupCommentLineTransformer(section.code)],
            }),
          })),
        )
      : undefined;

    return {
      ...variant,
      highlighted: await codeToHtml(variant.code, {
        lang: variant.language,
        theme: "github-dark",
      }),
      highlightedSections,
      label: variant.label ?? codeVariantLabels[variant.id],
    };
  }

  onMount(() => {
    let cancelled = false;

    void Promise.all(variants.map(highlightVariant)).then((nextVariants) => {
      if (!cancelled) {
        highlightedVariants = nextVariants;
      }
    });

    return () => {
      cancelled = true;
    };
  });

  $: active =
    highlightedVariants.find((variant) => variant.id === $activeCodeVariant) ??
    highlightedVariants[0];
  $: fallback =
    variants.find((variant) => variant.id === $activeCodeVariant) ??
    variants[0];
  $: displayVariant = active ?? fallback;
  $: hasVariantPicker = variants.length > 1;
</script>

{#if displayVariant}
  <div
    class={[
      "min-w-0 overflow-hidden rounded-md border border-[rgba(244,239,225,0.1)] bg-[var(--docs-code)]",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    data-active-variant={displayVariant.id}
  >
    <div
      class="flex min-h-[38px] flex-wrap items-center justify-between gap-3 border-b border-[rgba(244,239,225,0.1)] bg-[#1c1d18] py-1.5 pr-2 pl-3 text-xs leading-[1.5] text-[var(--docs-muted)]"
    >
      <div class="inline-flex min-w-0 flex-auto flex-wrap items-center gap-[9px]">
        <span>{title ?? displayVariant.language}</span>
        {#if hasVariantPicker}
          <div
            class="inline-flex shrink-0 items-center overflow-hidden rounded-patchbay border border-[rgba(244,239,225,0.12)] bg-[#11120f]"
            role="group"
            aria-label="Code language"
          >
            {#each variants as variant, index}
              <button
                aria-pressed={variant.id === $activeCodeVariant}
                class={[
                  "min-h-6 cursor-pointer border-0 bg-transparent px-[9px] text-[11px] text-[var(--docs-muted)] hover:text-[var(--text-color)] focus-visible:text-[var(--text-color)] focus-visible:outline-none",
                  index === variants.length - 1
                    ? "border-r-0"
                    : "border-r border-[rgba(244,239,225,0.1)]",
                  variant.id === $activeCodeVariant
                    ? "bg-[var(--modulation-color)] text-[#11120f] hover:text-[#11120f] focus-visible:text-[#11120f]"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                on:click={() => setCodeVariant(variant.id)}
                type="button"
              >
                {variant.label ?? codeVariantLabels[variant.id]}
              </button>
            {/each}
          </div>
        {/if}
      </div>
      <CopyButton
        label={copyLabel}
        successLabel={copySuccessLabel}
        text={displayVariant.code}
      />
    </div>

    {#if active?.highlightedSections?.length}
      <div
        class="min-w-0 max-h-[520px] overflow-auto [scrollbar-color:var(--control-border)_transparent] [&_.line]:!inline [&_.line]:!h-auto [&_.line]:!w-auto [&_.line]:!border-0 [&_.line]:!bg-transparent [&_code]:font-mono [&_code]:text-[13px] [&_code]:leading-[1.6] [&_code]:whitespace-pre [&_pre]:m-0 [&_pre]:max-h-none [&_pre]:max-w-none [&_pre]:min-w-max [&_pre]:overflow-visible [&_pre]:!bg-transparent [&_pre]:px-4 [&_pre]:py-0 [&_pre]:text-[var(--text-color)]"
      >
        {#each active.highlightedSections as section, index}
          <div
            class={[
              "min-w-max",
              index === 0 ? "[&_pre]:pt-4" : "[&_pre]:pt-2.5",
              index === active.highlightedSections.length - 1
                ? "[&_pre]:pb-4"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            data-section-title={section.title}
          >
            {@html section.highlighted}
          </div>
        {/each}
      </div>
    {:else if active}
      <div
        class="min-w-0 overflow-hidden [&_.line]:!inline [&_.line]:!h-auto [&_.line]:!w-auto [&_.line]:!border-0 [&_.line]:!bg-transparent [&_code]:font-mono [&_code]:text-[13px] [&_code]:leading-[1.6] [&_code]:whitespace-pre [&_pre]:m-0 [&_pre]:max-h-[360px] [&_pre]:max-w-full [&_pre]:overflow-auto [&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:text-[var(--text-color)] [&_pre]:[scrollbar-color:var(--control-border)_transparent]"
      >
        {@html active.highlighted}
      </div>
    {:else}
      <div
        class="min-w-0 overflow-hidden [&_code]:font-mono [&_code]:text-[13px] [&_code]:leading-[1.6] [&_code]:whitespace-pre [&_pre]:m-0 [&_pre]:max-h-[360px] [&_pre]:max-w-full [&_pre]:overflow-auto [&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:text-[var(--text-color)] [&_pre]:[scrollbar-color:var(--control-border)_transparent]"
      >
        <pre><code>{displayVariant.code}</code></pre>
      </div>
    {/if}
  </div>
{/if}
