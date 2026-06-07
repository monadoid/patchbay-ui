<script lang="ts">
  import type { StatusTone } from "./composites";

  export let label = "";
  export let pulse = false;
  export let tone: StatusTone = "idle";
  export let value = "";

  let className = "";
  export { className as class };
</script>

<span
  {...$$restProps}
  class={["status-indicator", className].filter(Boolean).join(" ")}
  data-pulse={pulse ? "true" : undefined}
  data-tone={tone}
>
  <span aria-hidden="true" class="status-indicator__dot"></span>
  {#if label}
    <span class="status-indicator__label">{label}</span>
  {/if}
  {#if value}
    <strong class="status-indicator__value">{value}</strong>
  {/if}
</span>
