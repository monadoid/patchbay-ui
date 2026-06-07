<script lang="ts">
  import { onDestroy, tick } from "svelte";
  import { defineElements, initUi } from "@patchbay/ui";

  export let code: string;

  let root: HTMLDivElement | undefined;
  let cleanups: Array<() => void> = [];

  function getExecutableParts(source: string) {
    const template = document.createElement("template");
    template.innerHTML = source;

    const scripts = Array.from(template.content.querySelectorAll("script")).map(
      (script) => {
        script.remove();
        return script.textContent ?? "";
      },
    );

    return {
      fragment: template.content,
      scripts,
    };
  }

  function cleanup() {
    if (!root) {
      return;
    }

    root.dispatchEvent(new CustomEvent("patchbay-example-cleanup"));
    cleanups.forEach((remove) => remove());
    cleanups = [];
    root.replaceChildren();
  }

  async function renderExample(source: string) {
    if (!root) {
      return;
    }

    await tick();
    cleanup();

    const { fragment, scripts } = getExecutableParts(source);
    root.replaceChildren(fragment.cloneNode(true));

    defineElements();
    initUi(root);

    scripts.forEach((scriptText) => {
      if (!root) {
        return;
      }

      const script = document.createElement("script");
      script.textContent = scriptText;
      root.appendChild(script);
      cleanups.push(() => script.remove());
    });
  }

  $: if (root) {
    void renderExample(code);
  }

  onDestroy(cleanup);
</script>

<div
  bind:this={root}
  class="[display:grid] min-w-[min(100%,420px)] place-items-center [&_.demo-group]:justify-center [&_.line-set]:justify-center"
  data-patchbay-example=""
></div>
