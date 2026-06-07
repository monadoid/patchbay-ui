<script lang="ts">
  import Dial from "./Dial.svelte";
  import {
    defaultMacroRackMacros,
    type MacroRackMacro,
  } from "./composites";

  export let columns: 2 | 4 | 8 = 4;
  export let disabled = false;
  export let label = "Macro rack";
  export let macros: MacroRackMacro[] = defaultMacroRackMacros;
  export let onMacroChange:
    | ((id: string, value: number, macro: MacroRackMacro) => void)
    | undefined = undefined;

  let className = "";
  export { className as class };

  function handleMacroChange(macro: MacroRackMacro, value: number) {
    macros = macros.map((item) =>
      item.id === macro.id ? { ...item, value } : item,
    );
    onMacroChange?.(macro.id, value, macro);
  }
</script>

<div
  {...$$restProps}
  aria-label={label}
  class={["macro-rack", className].filter(Boolean).join(" ")}
  role="group"
  style={`--macro-rack-columns: ${columns}`}
>
  {#each macros as macro (macro.id)}
    <Dial
      class="macro-rack__control"
      disabled={disabled || macro.disabled}
      label={macro.label}
      max={macro.max}
      min={macro.min}
      mode={macro.mode}
      onValueChange={(value) => handleMacroChange(macro, value)}
      step={macro.step}
      value={macro.value}
    />
  {/each}
</div>
