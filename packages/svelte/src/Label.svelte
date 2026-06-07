<script lang="ts">
  import { parseComponentProps } from "@patchbay/ui";

  export let text = "";
  export let align: "left" | "center" | "right" = "left";

  let className = "";
  export { className as class };

  $: props = parseComponentProps("label", { align, text });
</script>

<p class={["label", className].filter(Boolean).join(" ")} style={`text-align: ${props.align}`}>{props.text}</p>
