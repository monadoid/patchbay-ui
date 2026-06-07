<script lang="ts">
  export let title: string | undefined = undefined;

  let className = "";
  export { className as class };
</script>

<section
  {...$$restProps}
  class={["panel-section", className].filter(Boolean).join(" ")}
>
  {#if title}
    <div class="panel-section__header">
      <h4 class="panel-section__title">{title}</h4>
      <div class="panel-section__actions">
        <slot name="actions" />
      </div>
    </div>
  {/if}
  <div class="panel-section__body">
    <slot />
  </div>
</section>
