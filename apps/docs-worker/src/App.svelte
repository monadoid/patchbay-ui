<script lang="ts">
  import CodeBlock from "./components/CodeBlock.svelte";
  import ComponentPreview from "./components/ComponentPreview.svelte";
  import CopyButton from "./components/CopyButton.svelte";
  import PatchbayShowcase from "./components/PatchbayShowcase.svelte";
  import {
    componentExamples,
    getStartedVariants,
    pageMarkdown,
  } from "./lib/docs-content";
</script>

<main
  class="mx-auto w-[calc(100vw-32px)] max-w-[1180px] pt-8 pb-14 max-[860px]:w-[calc(100vw-24px)] max-[860px]:max-w-[720px] max-[860px]:pt-3.5"
>
  <div class="mb-3 flex justify-end max-[520px]:w-full max-[520px]:justify-center">
    <CopyButton
      className="max-[520px]:w-full"
      label="Copy page as Markdown"
      successLabel="Markdown copied"
      text={pageMarkdown}
    />
  </div>

  <section
    class="[display:grid] min-h-[520px] grid-cols-[minmax(0,0.82fr)_minmax(420px,1fr)] items-stretch gap-[18px] py-5 pb-[18px] max-[860px]:min-h-0 max-[860px]:grid-cols-1"
  >
    <div
      class="flex min-h-[420px] flex-col justify-center gap-[26px] rounded-lg border border-[var(--docs-line-soft)] bg-[var(--docs-surface)] p-7 max-[860px]:min-h-0 max-[520px]:p-3.5"
    >
      <h1 class="m-0 max-w-[8ch] text-[76px] leading-[0.94] font-bold text-[var(--text-color)] max-[860px]:text-[46px]">
        patchbay ui
      </h1>
      <p class="m-0 max-w-[34rem] text-[17px] leading-[1.55] text-[var(--docs-muted)]">
        Native HTML controls for audio-extension UIs. Use them from vanilla
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
        Copy one setup path.
      </h2>
      <p class="mt-2.5 mb-0 max-w-[56rem] leading-[1.55] text-[var(--docs-muted)]">
        Choose a renderer, then copy the whole block into your editor or hand
        it to an LLM. It includes the install command, the one-time CSS/setup
        step, the optional Tailwind theme, and a first control.
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
          markdown={example.markdown}
          title={example.title}
        />
      {/each}
    </div>
  </section>
</main>
