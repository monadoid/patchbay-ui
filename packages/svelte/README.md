# @patchbayhq/svelte

Svelte wrappers for patchbay UI audio controls.

```bash
pnpm add @patchbayhq/svelte
```

```svelte
<script lang="ts">
  import "@patchbayhq/svelte/styles.css";
  import { Slider } from "@patchbayhq/svelte";

  let value = 0.42;
</script>

<Slider label="Filter" bind:value modulation={0.64} />
```

Docs: https://ui.patchbay.tools
