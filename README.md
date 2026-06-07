# patchbay ui

Native HTML controls for audio-extension UIs. Use them from vanilla JavaScript, React, or Svelte.

patchbay ui is HTML-first and framework-neutral at the core, with small React and Svelte wrappers over the same controls and CSS.

## Get Started

Choose one setup path. Each package includes the base control styles; import those styles once near your app root.

### Vanilla

```bash
pnpm add @patchbay/ui
```

```ts
import "@patchbay/ui/styles.css";
import { defineElements, initUi } from "@patchbay/ui";

const device = document.querySelector("[data-patchbay-device]");

defineElements();
if (device) initUi(device);
```

```html
<section class="device-shell" data-patchbay-device>
  <label class="field">
    <span class="field__label">Filter</span>
    <span class="slider" data-slider data-orientation="vertical" data-modulation="0.64">
      <input type="range" min="0" max="1" step="0.01" value="0.42" aria-label="Filter" />
    </span>
  </label>
</section>
```

### React

```bash
pnpm add @patchbay/react
```

```tsx
import "@patchbay/react/styles.css";
import { Slider } from "@patchbay/react";

export function DevicePanel() {
  return <Slider label="Filter" value={0.42} modulation={0.64} orientation="vertical" />;
}
```

### Svelte

```bash
pnpm add @patchbay/svelte
```

```svelte
<script lang="ts">
  import "@patchbay/svelte/styles.css";
  import { Slider } from "@patchbay/svelte";

  let value = 0.42;
</script>

<Slider label="Filter" bind:value modulation={0.64} orientation="vertical" />
```

## Optional Tailwind Theme

```css
@import "tailwindcss";
@import "@patchbay/ui/styles.css";
@import "@patchbay/ui/tailwind.css";
```

Use `@patchbay/react/tailwind.css` or `@patchbay/svelte/tailwind.css` when installing a framework wrapper.

## Legal

patchbay ui does not redistribute third-party application assets, binaries, fonts, screenshots, or theme files. Component geometry, color tokens, and interaction behavior are original HTML, CSS, SVG, and Canvas implementations for general audio and creative tool interfaces.

patchbay ui is independent software and is not affiliated with or endorsed by any DAW, plugin, hardware, or device vendor.

## License

MIT. See [LICENSE](LICENSE).
