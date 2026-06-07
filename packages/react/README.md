# @patchbayhq/react

React wrappers for patchbay UI audio controls.

```bash
pnpm add @patchbayhq/react
```

```tsx
import "@patchbayhq/react/styles.css";
import { Slider } from "@patchbayhq/react";

export function DevicePanel() {
  return <Slider label="Filter" value={0.42} modulation={0.64} />;
}
```

Docs: https://ui.patchbay.tools
