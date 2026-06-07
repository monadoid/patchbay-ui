<script lang="ts">
  import { parseComponentProps } from "@patchbay/ui";

  export let label = "Drop Something Here!";
  export let accept: string | string[] | undefined = undefined;
  export let multiple = false;
  export let disabled = false;
  export let onFilesChange: ((files: FileList) => void) | undefined = undefined;

  let className = "";
  export { className as class };

  $: props = parseComponentProps("drop", { accept, disabled, label, multiple });
  $: acceptValue = Array.isArray(props.accept) ? props.accept.join(",") : props.accept;

  function handleChange(event: Event) {
    const files = (event.currentTarget as HTMLInputElement).files;
    if (files) onFilesChange?.(files);
  }
</script>

<label class={["drop", className].filter(Boolean).join(" ")} title={props.label}>
  <input aria-label={props.label} accept={acceptValue} disabled={props.disabled} multiple={props.multiple} type="file" on:change={handleChange} />
  <span aria-hidden="true"></span>
</label>
