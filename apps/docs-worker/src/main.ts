import "./app.css";
import "@patchbay/ui/styles.css";
import "./docs-theme.css";

import { mount } from "svelte";

import App from "./App.svelte";

const target = document.getElementById("app");

if (!target) {
  throw new Error("Missing #app root");
}

mount(App, { target });
