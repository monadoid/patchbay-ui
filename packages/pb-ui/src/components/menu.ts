type MenuRoot = HTMLElement & {
  __menuController?: MenuController;
};

type MenuOption = HTMLButtonElement & {
  dataset: DOMStringMap & {
    value?: string;
  };
};

export type MenuChangeDetail = {
  label: string;
  source: "user";
  value: string;
};

const controllerKey = "__menuController";

export function initMenus(root: ParentNode = document): void {
  root.querySelectorAll<MenuRoot>("[data-menu]").forEach((element) => {
    if (!element[controllerKey]) {
      element[controllerKey] = new MenuController(element);
    }
    element[controllerKey]?.sync();
  });
}

class MenuController {
  private activeIndex = 0;
  private readonly button: HTMLButtonElement | null;
  private readonly list: HTMLElement | null;

  constructor(private readonly root: MenuRoot) {
    this.button = root.querySelector<HTMLButtonElement>(".menu__button");
    this.list = root.querySelector<HTMLElement>(".menu__list");

    this.button?.addEventListener("click", () => this.toggle());
    this.button?.addEventListener("keydown", (event) =>
      this.handleKeydown(event),
    );
    this.options.forEach((option, index) => {
      option.addEventListener("click", () => this.commit(index));
      option.addEventListener("mouseenter", () => {
        this.activeIndex = index;
        this.sync();
      });
    });
    this.root.addEventListener("focusout", (event) => {
      if (
        event.relatedTarget instanceof Node &&
        this.root.contains(event.relatedTarget)
      ) {
        return;
      }
      this.setOpen(false);
    });

    this.sync();
  }

  get options(): MenuOption[] {
    return Array.from(this.root.querySelectorAll<MenuOption>(".menu__option"));
  }

  sync(): void {
    const options = this.options;
    const selectedIndex = Math.max(
      0,
      options.findIndex((option) => option.dataset.value === this.value),
    );
    const selected = options[selectedIndex] ?? options[0];

    this.activeIndex = Math.min(this.activeIndex, Math.max(options.length - 1, 0));

    if (selected && !this.root.dataset.value) {
      this.root.dataset.value = selected.dataset.value ?? selected.textContent ?? "";
    }
    if (this.button) {
      const value = this.button.querySelector<HTMLElement>(".menu__value");
      if (value && selected) {
        value.textContent = selected.textContent ?? "";
      }
      this.button.setAttribute("aria-expanded", String(this.open));
    }
    if (this.list) {
      this.list.hidden = !this.open;
      this.list.setAttribute(
        "aria-activedescendant",
        options[this.activeIndex]?.id ?? "",
      );
    }

    options.forEach((option, index) => {
      const selectedOption = option === selected;

      option.classList.toggle("is-active", index === this.activeIndex);
      option.classList.toggle("is-selected", selectedOption);
      option.setAttribute("aria-selected", String(selectedOption));
      option.id ||= `${this.list?.id ?? "menu"}-option-${index}`;
      if (!option.dataset.value) {
        option.dataset.value = option.textContent ?? "";
      }
    });
  }

  private get open(): boolean {
    return this.root.dataset.open === "true";
  }

  private get value(): string {
    return this.root.dataset.value ?? "";
  }

  private setOpen(open: boolean): void {
    if (open) {
      this.root.dataset.open = "true";
    } else {
      delete this.root.dataset.open;
    }
    this.sync();
  }

  private toggle(): void {
    this.setOpen(!this.open);
  }

  private firstEnabledIndex(startIndex: number, direction: 1 | -1): number {
    const options = this.options;

    for (let offset = 0; offset < options.length; offset += 1) {
      const index =
        (startIndex + offset * direction + options.length) % options.length;
      if (!options[index]?.disabled) return index;
    }

    return this.activeIndex;
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      this.activeIndex = this.firstEnabledIndex(
        this.activeIndex + direction,
        direction,
      );
      this.setOpen(true);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (this.open) {
        this.commit(this.activeIndex);
      } else {
        this.setOpen(true);
      }
      return;
    }

    if (event.key === "Escape") {
      this.setOpen(false);
    }
  }

  private commit(index: number): void {
    const option = this.options[index];
    if (!option || option.disabled) return;

    this.root.dataset.value = option.dataset.value ?? option.textContent ?? "";
    this.activeIndex = index;
    this.setOpen(false);
    this.root.dispatchEvent(
      new CustomEvent<MenuChangeDetail>("menu-change", {
        bubbles: true,
        detail: {
          label: option.textContent ?? "",
          source: "user",
          value: this.root.dataset.value,
        },
      }),
    );
  }
}
