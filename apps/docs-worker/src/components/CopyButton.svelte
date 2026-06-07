<script lang="ts">
  import { Check, Clipboard } from "lucide-svelte";

  export let className = "";
  export let errorLabel = "Copy failed";
  export let label = "Copy";
  export let successLabel = "Copied";
  export let text: string;

  let status: "idle" | "copied" | "failed" = "idle";

  async function copyText(value: string) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return;
      } catch {
        // Some embedded browsers expose clipboard APIs but deny writes.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.insetInlineStart = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();

    if (!copied) {
      throw new Error("Unable to copy text.");
    }
  }

  async function copy() {
    try {
      await copyText(text);
      status = "copied";
    } catch {
      status = "failed";
    }

    window.setTimeout(() => {
      status = "idle";
    }, 2400);
  }

  $: message =
    status === "copied"
      ? successLabel
      : status === "failed"
        ? errorLabel
        : label;
</script>

<button
  aria-label={message}
  class={[
    "inline-flex min-h-8 cursor-pointer items-center justify-center gap-[7px] whitespace-nowrap rounded-patchbay border border-patchbay-border bg-patchbay-bg px-3 text-patchbay-text no-underline shadow-[inset_0_1px_0_rgba(244,239,225,0.08)] hover:border-patchbay-focus focus-visible:border-patchbay-focus focus-visible:outline-none [&_svg]:shrink-0",
    className,
  ]
    .filter(Boolean)
    .join(" ")}
  on:click={copy}
  type="button"
>
  {#if status === "copied"}
    <Check aria-hidden="true" size={14} strokeWidth={2} />
  {:else}
    <Clipboard aria-hidden="true" size={14} strokeWidth={2} />
  {/if}
  <span aria-live="polite">{message}</span>
</button>
