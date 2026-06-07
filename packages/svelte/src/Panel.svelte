<script lang="ts">
  export let compact = false;

  let className = "";
  export { className as class };
</script>

<section
  {...$$restProps}
  class={["panel", compact && "panel--compact", className].filter(Boolean).join(" ")}
>
  <slot />
</section>
