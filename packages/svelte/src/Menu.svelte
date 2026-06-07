<script lang="ts">
  import { parseComponentProps, type MenuItem } from "@patchbay/ui";

  export let value = "classic";
  export let items: MenuItem[] = [
    { value: "classic", label: "Classic", disabled: false },
  ];
  export let disabled = false;
  export let onValueChange: ((value: string) => void) | undefined = undefined;

  const id = `menu-${Math.random().toString(36).slice(2)}`;
  let className = "";
  let open = false;
  let activeIndex = 0;
  export { className as class };

  $: props = parseComponentProps("menu", { disabled, items, value });
  $: selectedIndex = Math.max(
    0,
    props.items.findIndex((item) => item.value === props.value),
  );
  $: selected = props.items[selectedIndex] ?? props.items[0];

  function firstEnabledIndex(startIndex: number, direction: 1 | -1) {
    for (let offset = 0; offset < props.items.length; offset += 1) {
      const index =
        (startIndex + offset * direction + props.items.length) %
        props.items.length;
      if (!props.items[index]?.disabled) return index;
    }

    return selectedIndex;
  }

  function commit(index: number) {
    const item = props.items[index];
    if (!item || item.disabled) return;

    value = item.value;
    activeIndex = index;
    open = false;
    onValueChange?.(value);
  }

  function toggleOpen() {
    activeIndex = selectedIndex;
    open = !open;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      activeIndex = firstEnabledIndex(activeIndex + direction, direction);
      open = true;
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        commit(activeIndex);
      } else {
        open = true;
      }
      return;
    }

    if (event.key === "Escape") {
      open = false;
    }
  }

  function handleBlur(event: FocusEvent) {
    const nextTarget = event.relatedTarget;
    if (
      nextTarget instanceof Node &&
      event.currentTarget instanceof HTMLElement &&
      event.currentTarget.contains(nextTarget)
    ) {
      return;
    }

    open = false;
  }
</script>

<div
  class={["menu", className].filter(Boolean).join(" ")}
  data-open={open ? "true" : undefined}
  on:blur={handleBlur}
>
  <button
    aria-controls={`${id}-listbox`}
    aria-expanded={open}
    aria-haspopup="listbox"
    class="menu__button"
    {disabled}
    id={`${id}-button`}
    type="button"
    on:click={toggleOpen}
    on:keydown={handleKeydown}
  >
    <span class="menu__value">{selected?.label ?? "Select"}</span>
    <span aria-hidden="true" class="menu__chevron"></span>
  </button>

  {#if open}
    <div
      aria-activedescendant={`${id}-option-${activeIndex}`}
      class="menu__list"
      id={`${id}-listbox`}
      role="listbox"
      tabindex="-1"
    >
      {#each props.items as item, index (item.value)}
        <button
          aria-disabled={item.disabled ? "true" : undefined}
          aria-selected={item.value === props.value}
          class={[
            "menu__option",
            index === activeIndex && "is-active",
            item.value === props.value && "is-selected",
          ]
            .filter(Boolean)
            .join(" ")}
          disabled={item.disabled}
          id={`${id}-option-${index}`}
          role="option"
          type="button"
          on:click={() => commit(index)}
          on:mouseenter={() => (activeIndex = index)}
        >
          {item.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
