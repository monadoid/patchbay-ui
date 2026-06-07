<script lang="ts">
  import CodeBlock from "./CodeBlock.svelte";
  import PatchbayExample from "./PatchbayExample.svelte";
  import type { CodeVariantSource } from "../lib/code-variants";

  export let code: string;
  export let codeVariants: CodeVariantSource[];
  export let description: string;
  export let id: string;
  export let title: string;
</script>

<section
  class="min-w-0 rounded-lg border border-[var(--docs-line-soft)] bg-[var(--docs-surface)] p-[18px] max-[520px]:p-3.5"
  data-component-preview=""
  {id}
>
  <div class="mb-4 min-w-0">
    <div class="min-w-0">
      <h2 class="m-0 text-[26px] leading-[1.15] text-[var(--text-color)]">
        {title}
      </h2>
      <p class="mt-2.5 mb-0 max-w-[56rem] leading-[1.55] text-[var(--docs-muted)]">
        {description}
      </p>
    </div>
  </div>
  <div
    class="[display:grid] min-h-[250px] place-items-center rounded-t-md border border-[rgba(244,239,225,0.1)] bg-[#151611] p-6"
  >
    <PatchbayExample {code} />
  </div>
  <CodeBlock
    className="rounded-t-none border-t-0"
    title="Example"
    variants={codeVariants}
  />
</section>
