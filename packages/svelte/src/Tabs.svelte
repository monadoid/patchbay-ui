<script lang="ts">
  import { parseComponentProps, type TabItem } from "@patchbayhq/ui";

  export let value = "one";
  export let items: TabItem[] = [{ value: "one", label: "One", disabled: false }];
  export let disabled = false;
  export let onValueChange: ((value: string) => void) | undefined = undefined;

  let className = "";
  export { className as class };

  $: props = parseComponentProps("tabs", { disabled, items, value });

  function select(nextValue: string) {
    value = nextValue;
    onValueChange?.(value);
  }
</script>

<div class={["tabs", className].filter(Boolean).join(" ")} role="tablist">
  {#each props.items as item (item.value)}
    <button
      aria-selected={item.value === props.value}
      class={["tab", item.value === props.value ? "is-active" : ""].filter(Boolean).join(" ")}
      disabled={props.disabled || item.disabled}
      role="tab"
      type="button"
      on:click={() => select(item.value)}
    >
      {item.label}
    </button>
  {/each}
</div>
