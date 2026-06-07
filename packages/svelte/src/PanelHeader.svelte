<script lang="ts">
  export let eyebrow: string | undefined = undefined;
  export let subtitle: string | undefined = undefined;
  export let title: string | undefined = undefined;

  let className = "";
  export { className as class };
</script>

<header
  {...$$restProps}
  class={["panel-header", className].filter(Boolean).join(" ")}
>
  <div class="panel-header__main">
    {#if eyebrow}
      <span class="panel-header__eyebrow">{eyebrow}</span>
    {/if}
    {#if title}
      <h3 class="panel-header__title">{title}</h3>
    {/if}
    {#if subtitle}
      <p class="panel-header__subtitle">{subtitle}</p>
    {/if}
  </div>
  <div class="panel-header__actions">
    <slot />
  </div>
</header>
