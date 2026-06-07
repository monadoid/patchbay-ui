import {
  createComponentErrorDetail,
  formatZodIssues,
  parseSliderProps,
  safeParseComponentProps,
  type ComponentErrorCode,
  type ComponentErrorDetail,
} from "../api";
import { initEnvelopeEditors } from "./adsr";
import { initMenus } from "./menu";
import { defineSequencerElements } from "./sequencers";

type SliderRoot = HTMLElement & { __sliderController?: SliderController };

const controllerKey = "__sliderController";

export function initUi(root: ParentNode = document): void {
  initSliders(root);
  initEnvelopeEditors(root);
  initMenus(root);
}

export function defineElements(): void {
  if (!customElements.get("range-slider")) {
    customElements.define("range-slider", SliderElement);
  }

  defineSequencerElements();
}

export function initSliders(root: ParentNode = document): void {
  root.querySelectorAll<SliderRoot>("[data-slider]").forEach((element) => {
    const input = element.querySelector<HTMLInputElement>(
      'input[type="range"]',
    );
    if (!input) {
      reportComponentError(
        element,
        "slider",
        "missing-control",
        "data-slider requires an input[type=range]",
      );
      return;
    }

    if (!element[controllerKey]) {
      element[controllerKey] = new SliderController(element, input);
    }
    element[controllerKey]?.sync();
  });
}

class SliderController {
  private readonly input: HTMLInputElement;
  private readonly rail: HTMLElement;
  private readonly thumb: HTMLElement;
  private readonly modulation: HTMLElement;
  private readonly valueText: HTMLElement | null;
  private dragging = false;

  constructor(
    private readonly root: SliderRoot,
    input: HTMLInputElement,
  ) {
    this.input = input;
    this.root.classList.add("slider");
    this.root.dataset.orientation ||= "vertical";

    this.rail = this.ensurePart("fill");
    this.thumb = this.ensurePart("thumb");
    this.modulation = this.ensurePart("modulation");
    this.valueText = this.root.querySelector<HTMLElement>(
      "[data-slider-value]",
    );

    this.root.addEventListener("pointerdown", (event) =>
      this.handlePointerDown(event),
    );
    this.root.addEventListener("pointermove", (event) =>
      this.handlePointerMove(event),
    );
    this.root.addEventListener("pointerup", (event) =>
      this.handlePointerUp(event),
    );
    this.root.addEventListener("pointercancel", (event) =>
      this.handlePointerUp(event),
    );

    this.input.addEventListener("input", () => this.sync());
    this.input.addEventListener("change", () => this.sync());
    this.input.addEventListener("focus", () => {
      this.root.dataset.focused = "true";
    });
    this.input.addEventListener("blur", () => {
      delete this.root.dataset.focused;
    });

    this.sync();
  }

  sync(): void {
    const min = Number(this.input.min || 0);
    const max = Number(this.input.max || 100);
    const value = Number(this.input.value || 0);
    const range = max - min || 1;
    const ratio = Math.min(1, Math.max(0, (value - min) / range));
    const orientation =
      this.root.dataset.orientation === "horizontal"
        ? "horizontal"
        : "vertical";
    const modulation = Number(
      this.root.dataset.modulation ?? this.input.dataset.modulation ?? value,
    );
    const modulationRatio = Math.min(
      1,
      Math.max(0, (modulation - min) / range),
    );
    const horizontalPosition = `calc(6px + (100% - 12px) * ${ratio})`;
    const horizontalModulationPosition = `calc(6px + (100% - 12px) * ${modulationRatio})`;
    const verticalPosition = `calc(6px + (100% - 12px) * ${1 - ratio})`;
    const verticalModulationPosition = `calc(6px + (100% - 12px) * ${1 - modulationRatio})`;

    this.root.style.setProperty("--slider-value", String(ratio));
    this.root.style.setProperty(
      "--slider-modulation",
      String(modulationRatio),
    );
    this.root.setAttribute("aria-orientation", orientation);

    this.rail.removeAttribute("style");

    if (orientation === "horizontal") {
      this.thumb.style.left = horizontalPosition;
      this.thumb.style.top = "";
      this.modulation.style.left = horizontalModulationPosition;
      this.modulation.style.top = "";
    } else {
      this.thumb.style.top = verticalPosition;
      this.thumb.style.left = "";
      this.modulation.style.top = verticalModulationPosition;
      this.modulation.style.left = "";
    }

    if (this.valueText) {
      this.valueText.textContent = value.toFixed(this.decimals());
    }
  }

  private ensurePart(part: string): HTMLElement {
    const selector = `[data-slider-${part}]`;
    const existing = this.root.querySelector<HTMLElement>(selector);
    if (existing) {
      return existing;
    }
    const element = document.createElement("span");
    element.dataset[`slider${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`] =
      "";
    element.className = `slider__${part}`;
    element.setAttribute("aria-hidden", "true");
    this.root.append(element);
    return element;
  }

  private decimals(): number {
    const step = this.input.step;
    if (!step || step === "any" || !step.includes(".")) {
      return 0;
    }
    return step.split(".")[1]?.length ?? 0;
  }

  private handlePointerDown(event: PointerEvent): void {
    if (event.button !== 0 || this.input.disabled) {
      return;
    }

    event.preventDefault();
    this.dragging = true;
    this.root.dataset.dragging = "true";
    this.input.focus({ preventScroll: true });
    this.root.setPointerCapture(event.pointerId);
    this.applyPointer(event);
  }

  private handlePointerMove(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }

    event.preventDefault();
    this.applyPointer(event);
  }

  private handlePointerUp(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }

    event.preventDefault();
    this.dragging = false;
    delete this.root.dataset.dragging;

    if (this.root.hasPointerCapture(event.pointerId)) {
      this.root.releasePointerCapture(event.pointerId);
    }

    this.input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  private applyPointer(event: PointerEvent): void {
    const rect = this.root.getBoundingClientRect();
    const orientation =
      this.root.dataset.orientation === "horizontal"
        ? "horizontal"
        : "vertical";
    const inset = 6;
    const travel =
      orientation === "horizontal"
        ? Math.max(1, rect.width - inset * 2)
        : Math.max(1, rect.height - inset * 2);
    const rawRatio =
      orientation === "horizontal"
        ? (event.clientX - rect.left - inset) / travel
        : 1 - (event.clientY - rect.top - inset) / travel;

    this.setRatio(Math.min(1, Math.max(0, rawRatio)));
  }

  private setRatio(ratio: number): void {
    const min = Number(this.input.min || 0);
    const max = Number(this.input.max || 100);
    const range = max - min || 1;
    const nextValue = this.snapToStep(min + range * ratio);
    const previousValue = this.input.value;

    this.input.value = this.formatInputValue(nextValue);
    this.sync();

    if (this.input.value !== previousValue) {
      this.input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  private snapToStep(value: number): number {
    const min = Number(this.input.min || 0);
    const stepAttr = this.input.step;

    if (!stepAttr || stepAttr === "any") {
      return value;
    }

    const step = Number(stepAttr);
    if (!Number.isFinite(step) || step <= 0) {
      return value;
    }

    return min + Math.round((value - min) / step) * step;
  }

  private formatInputValue(value: number): string {
    const decimals = this.decimals();
    return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
  }
}

class SliderElement extends HTMLElement {
  static observedAttributes = [
    "value",
    "min",
    "max",
    "step",
    "orientation",
    "label",
    "modulation",
    "disabled",
  ];

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) {
      this.render();
    }
  }

  private render(): void {
    const propsInput = {
      label: attributeValue(this, "label"),
      value: attributeValue(this, "value"),
      min: attributeValue(this, "min"),
      max: attributeValue(this, "max"),
      step: attributeValue(this, "step"),
      orientation: attributeValue(this, "orientation"),
      modulation: attributeValue(this, "modulation"),
      disabled: booleanAttributeValue(this, "disabled"),
    };
    const parsed = safeParseComponentProps("slider", propsInput);
    const props = parsed.success ? parsed.data : parseSliderProps({});

    if (parsed.success) {
      clearComponentError(this);
    } else {
      reportComponentError(
        this,
        "slider",
        "invalid-props",
        "Invalid slider attributes",
        {
          issues: formatZodIssues(parsed.error),
        },
      );
    }

    const label = escapeHtml(props.label);
    const value = String(props.value);
    const min = String(props.min);
    const max = String(props.max);
    const step = String(props.step);
    const modulation = String(props.modulation);
    const disabled = props.disabled ? " disabled" : "";

    if (!this.querySelector("[data-slider]")) {
      this.innerHTML = `
        <label class="field">
          <span class="field__label">${label}</span>
          <span class="slider" data-slider data-orientation="${props.orientation}" data-modulation="${modulation}">
            <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${label}"${disabled} />
          </span>
        </label>
      `;
    } else {
      const root = this.querySelector<HTMLElement>("[data-slider]");
      const input = this.querySelector<HTMLInputElement>('input[type="range"]');
      if (root) {
        root.dataset.orientation = props.orientation;
        root.dataset.modulation = modulation;
      }
      if (input) {
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = value;
        input.disabled = props.disabled;
        input.setAttribute("aria-label", props.label);
      }
    }

    initSliders(this);
  }
}

function attributeValue(element: Element, name: string): string | undefined {
  return element.getAttribute(name) ?? undefined;
}

function booleanAttributeValue(
  element: Element,
  name: string,
): string | boolean | undefined {
  if (!element.hasAttribute(name)) {
    return undefined;
  }
  return element.getAttribute(name) ?? true;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    if (character === "&") {
      return "&amp;";
    }
    if (character === "<") {
      return "&lt;";
    }
    if (character === ">") {
      return "&gt;";
    }
    if (character === '"') {
      return "&quot;";
    }
    return "&#39;";
  });
}

function reportComponentError(
  element: HTMLElement,
  component: string,
  code: ComponentErrorCode,
  message: string,
  options: { issues?: string[] } = {},
): void {
  const detail = createComponentErrorDetail({
    component,
    code,
    message,
    issues: options.issues ?? [],
  });
  element.dataset.invalid = "true";
  element.setAttribute("aria-invalid", "true");
  element.dispatchEvent(
    new CustomEvent<ComponentErrorDetail>("component-error", {
      bubbles: true,
      composed: true,
      detail,
    }),
  );
}

function clearComponentError(element: HTMLElement): void {
  delete element.dataset.invalid;
  element.removeAttribute("aria-invalid");
}
