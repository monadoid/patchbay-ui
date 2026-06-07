<script lang="ts">
  import { onMount } from "svelte";
  import { Store } from "lucide-svelte";
  import CodeBlock from "./components/CodeBlock.svelte";
  import ComponentPreview from "./components/ComponentPreview.svelte";
  import CopyButton from "./components/CopyButton.svelte";
  import PatchbayShowcase from "./components/PatchbayShowcase.svelte";
  import {
    componentExamples,
    getStartedVariants,
    pageMarkdownByVariant,
  } from "./lib/docs-content";
  import { activeCodeVariant } from "./lib/code-variant-state";

  const githubHref = "https://github.com/monadoid/patchbay-ui";
  const productionMarketplaceHref = "https://patchbay.tools/";
  const showMarketplaceLink = false;

  let marketplaceHref = productionMarketplaceHref;
  $: selectedPageMarkdown =
    pageMarkdownByVariant[$activeCodeVariant] ?? pageMarkdownByVariant.svelte;

  onMount(() => {
    const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
    marketplaceHref = localHosts.has(window.location.hostname)
      ? "http://localhost:7012/"
      : productionMarketplaceHref;
  });
</script>

<main
  class="mx-auto w-[calc(100vw-32px)] max-w-[1180px] pt-8 pb-14 max-[860px]:w-[calc(100vw-24px)] max-[860px]:max-w-[720px] max-[860px]:pt-3.5"
>
  <div class="mb-3 flex justify-end gap-2 max-[520px]:w-full max-[520px]:flex-col">
    {#if showMarketplaceLink}
      <a
        class="inline-flex min-h-8 items-center justify-center gap-[7px] whitespace-nowrap rounded-patchbay border border-patchbay-border bg-patchbay-bg px-3 text-patchbay-text no-underline shadow-[inset_0_1px_0_rgba(244,239,225,0.08)] hover:border-patchbay-focus focus-visible:border-patchbay-focus focus-visible:outline-none max-[520px]:w-full [&_svg]:shrink-0"
        href={marketplaceHref}
      >
        <Store aria-hidden="true" size={14} strokeWidth={2} />
        <span>extension registry</span>
      </a>
    {/if}
    <a
      class="inline-flex min-h-8 items-center justify-center gap-[7px] whitespace-nowrap rounded-patchbay border border-patchbay-border bg-patchbay-bg px-3 text-patchbay-text no-underline shadow-[inset_0_1px_0_rgba(244,239,225,0.08)] hover:border-patchbay-focus focus-visible:border-patchbay-focus focus-visible:outline-none max-[520px]:w-full [&_svg]:shrink-0"
      href={githubHref}
      rel="noreferrer"
      target="_blank"
    >
      <svg
        aria-hidden="true"
        class="size-3.5"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 3.86c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
        />
      </svg>
      <span>github</span>
    </a>
    <CopyButton
      className="max-[520px]:w-full"
      label="copy page"
      successLabel="copied"
      text={selectedPageMarkdown}
    />
  </div>

  <section
    class="[display:grid] min-h-[520px] grid-cols-[minmax(0,0.82fr)_minmax(420px,1fr)] items-stretch gap-[18px] py-5 pb-[18px] max-[860px]:min-h-0 max-[860px]:grid-cols-1"
  >
    <div
      class="flex min-h-[420px] flex-col justify-center gap-[26px] rounded-lg border border-[var(--docs-line-soft)] bg-[var(--docs-surface)] p-7 max-[860px]:min-h-0 max-[520px]:p-3.5"
    >
      <h1
        class="m-0 inline-grid w-fit max-w-full text-[76px] leading-[0.9] font-bold text-[var(--text-color)] max-[520px]:text-[52px]"
      >
        <span class="block whitespace-nowrap">patchbay</span>
        <span
          class="mt-0.5 block justify-self-end text-[0.54em] leading-[0.82] text-patchbay-focus"
          >ui</span
        >
      </h1>
      <p class="m-0 max-w-[34rem] text-[17px] leading-[1.55] text-[var(--docs-muted)]">
        Native HTML controls for audio extensions. Use them in vanilla
        JavaScript, React, or Svelte.
      </p>
    </div>
    <div
      class="[display:grid] min-h-[420px] place-items-center rounded-lg border border-[var(--docs-line-soft)] bg-[var(--docs-surface)] p-[26px] max-[860px]:min-h-0 max-[520px]:p-3.5"
    >
      <PatchbayShowcase />
    </div>
  </section>

  <section
    class="mt-[18px] [display:grid] min-w-0 grid-cols-[minmax(260px,0.7fr)_minmax(0,1fr)] items-start gap-[18px] rounded-lg border border-[var(--docs-line-soft)] bg-[var(--docs-surface)] p-[18px] max-[860px]:grid-cols-1 max-[520px]:p-3.5"
    id="install"
  >
    <div class="min-w-0">
      <p class="m-0 mb-3 text-xs leading-[1.55] font-bold text-[var(--docs-muted)] uppercase">
        Install
      </p>
      <h2 class="m-0 text-[26px] leading-[1.15] text-[var(--text-color)]">
        Give this to your LLM.
      </h2>
      <p class="mt-2.5 mb-0 max-w-[56rem] leading-[1.55] text-[var(--docs-muted)]">
        Choose a framework and copy the whole block. Install the npm package,
        add the base CSS, and optionally add the Tailwind theme (or use without
        Tailwind).
      </p>
    </div>
    <div class="[display:grid] min-w-0 gap-3.5">
      <CodeBlock
        copyLabel="Copy for LLM"
        copySuccessLabel="Copied for LLM"
        title="Setup"
        variants={getStartedVariants}
      />
    </div>
  </section>

  <section class="mt-[18px]" id="components">
    <div class="min-w-0 max-w-[760px]">
      <h2 class="m-0 text-[26px] leading-[1.15] text-[var(--text-color)]">
        Components
      </h2>
    </div>
    <div class="mt-[18px] [display:grid] min-w-0 gap-[18px]">
      {#each componentExamples as example}
        <ComponentPreview
          code={example.code}
          codeVariants={example.codeVariants}
          description={example.description}
          id={example.id}
          title={example.title}
        />
      {/each}
    </div>
  </section>
</main>
