type EnvelopeHandleName =
  | "start"
  | "attack"
  | "decay"
  | "sustain"
  | "release"
  | "end";

type EnvelopePoint = {
  x: number;
  y: number;
};

type EnvelopeRoot = SVGSVGElement & {
  __envelopeController?: EnvelopeController;
};

const envelopeControllerKey = "__envelopeController";

export function initEnvelopeEditors(root: ParentNode = document): void {
  root.querySelectorAll<EnvelopeRoot>("[data-envelope]").forEach((svg) => {
    if (!svg[envelopeControllerKey]) {
      svg[envelopeControllerKey] = new EnvelopeController(svg);
    }
    svg[envelopeControllerKey]?.sync();
  });
}

class EnvelopeController {
  private activeHandle: EnvelopeHandleName | null = null;
  private activeHandleElement: SVGGraphicsElement | null = null;
  private activePointerId: number | null = null;
  private dragAbortController?: AbortController;
  private readonly curve: SVGPathElement | null;
  private readonly points: Record<EnvelopeHandleName, EnvelopePoint>;

  constructor(private readonly svg: EnvelopeRoot) {
    this.curve = svg.querySelector<SVGPathElement>("[data-envelope-curve]");
    this.points = this.readInitialPoints();

    this.svg
      .querySelectorAll<SVGGraphicsElement>("[data-envelope-handle]")
      .forEach((handle) => {
        handle.addEventListener("pointerdown", (event) =>
          this.handlePointerDown(event, handle),
        );
      });

    this.sync();
  }

  sync(): void {
    if (!this.curve) {
      return;
    }

    this.curve.setAttribute(
      "d",
      [
        `M${this.points.start.x} ${this.points.start.y}`,
        `L${this.points.attack.x} ${this.points.attack.y}`,
        `L${this.points.decay.x} ${this.points.decay.y}`,
        `L${this.points.sustain.x} ${this.points.sustain.y}`,
        `L170 ${this.points.sustain.y}`,
        `C171 ${this.points.release.y} ${this.points.release.x - 8} ${this.points.release.y} ${this.points.end.x} ${this.points.end.y}`,
      ].join(" "),
    );

    Object.entries(this.points).forEach(([name, point]) => {
      const handle = this.svg.querySelector<SVGGraphicsElement>(
        `[data-envelope-handle="${name}"]`,
      );
      if (!handle) {
        return;
      }
      if (handle instanceof SVGCircleElement) {
        handle.setAttribute("cx", String(point.x));
        handle.setAttribute("cy", String(point.y));
      } else {
        handle.setAttribute("x", String(point.x - 4));
        handle.setAttribute("y", String(point.y - 4));
      }
    });
  }

  private readInitialPoints(): Record<EnvelopeHandleName, EnvelopePoint> {
    return {
      start: this.readHandlePoint("start", { x: 8, y: 88 }),
      attack: this.readHandlePoint("attack", { x: 8, y: 12 }),
      decay: this.readHandlePoint("decay", { x: 24, y: 12 }),
      sustain: this.readHandlePoint("sustain", { x: 58, y: 12 }),
      release: this.readHandlePoint("release", { x: 178, y: 80 }),
      end: this.readHandlePoint("end", { x: 194, y: 88 }),
    };
  }

  private readHandlePoint(
    name: EnvelopeHandleName,
    fallback: EnvelopePoint,
  ): EnvelopePoint {
    const handle = this.svg.querySelector<SVGGraphicsElement>(
      `[data-envelope-handle="${name}"]`,
    );
    if (!handle) {
      return fallback;
    }

    if (handle instanceof SVGCircleElement) {
      return {
        x: numberAttribute(handle, "cx", fallback.x),
        y: numberAttribute(handle, "cy", fallback.y),
      };
    }

    return {
      x:
        numberAttribute(handle, "x", fallback.x - 4) +
        numberAttribute(handle, "width", 8) / 2,
      y:
        numberAttribute(handle, "y", fallback.y - 4) +
        numberAttribute(handle, "height", 8) / 2,
    };
  }

  private handlePointerDown(
    event: PointerEvent,
    handle: SVGGraphicsElement,
  ): void {
    if (event.button !== 0) {
      return;
    }

    const name = handle.dataset.envelopeHandle as EnvelopeHandleName | undefined;
    if (!name) {
      return;
    }

    event.preventDefault();
    this.finishDrag();

    this.activeHandle = name;
    this.activeHandleElement = handle;
    this.activePointerId = event.pointerId;
    safelySetPointerCapture(handle, event.pointerId);
    this.moveActiveHandle(event);

    const dragAbortController = new AbortController();
    this.dragAbortController = dragAbortController;
    const { signal } = dragAbortController;

    window.addEventListener("pointermove", this.handleWindowPointerMove, {
      signal,
    });
    window.addEventListener("pointerup", this.handleWindowPointerUp, {
      signal,
    });
    window.addEventListener("pointercancel", this.handleWindowPointerUp, {
      signal,
    });
    window.addEventListener("blur", this.handleWindowBlur, { signal });
  }

  private readonly handleWindowPointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    event.preventDefault();
    this.moveActiveHandle(event);
  };

  private readonly handleWindowPointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    event.preventDefault();
    this.moveActiveHandle(event);
    this.finishDrag();
  };

  private readonly handleWindowBlur = (): void => {
    this.finishDrag();
  };

  private moveActiveHandle(event: PointerEvent): void {
    if (!this.activeHandle) {
      return;
    }

    this.points[this.activeHandle] = this.constrainPoint(
      this.activeHandle,
      this.pointFromEvent(event),
    );
    this.sync();
  }

  private pointFromEvent(event: PointerEvent): EnvelopePoint {
    const rect = this.svg.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 210, 8, 202),
      y: clamp(((event.clientY - rect.top) / rect.height) * 96, 8, 88),
    };
  }

  private constrainPoint(name: EnvelopeHandleName, point: EnvelopePoint): EnvelopePoint {
    const baselineY = 88;
    const releaseSegmentX = 170;

    if (name === "start") {
      return { x: this.points.start.x, y: baselineY };
    }
    if (name === "attack") {
      return {
        x: clamp(point.x, this.points.start.x, this.points.decay.x),
        y: point.y,
      };
    }
    if (name === "decay") {
      return {
        x: clamp(point.x, this.points.attack.x, this.points.sustain.x),
        y: point.y,
      };
    }
    if (name === "sustain") {
      return {
        x: clamp(point.x, this.points.decay.x, releaseSegmentX),
        y: point.y,
      };
    }
    if (name === "release") {
      return {
        x: clamp(point.x, releaseSegmentX, this.points.end.x),
        y: clamp(point.y, this.points.sustain.y, baselineY),
      };
    }
    return { x: this.points.end.x, y: baselineY };
  }

  private finishDrag(): void {
    if (this.activeHandleElement && this.activePointerId !== null) {
      safelyReleasePointerCapture(
        this.activeHandleElement,
        this.activePointerId,
      );
    }

    this.dragAbortController?.abort();
    this.dragAbortController = undefined;
    this.activeHandle = null;
    this.activeHandleElement = null;
    this.activePointerId = null;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function numberAttribute(
  element: Element,
  attribute: string,
  fallback: number,
) {
  const value = Number(element.getAttribute(attribute));
  return Number.isFinite(value) ? value : fallback;
}

function safelySetPointerCapture(
  element: SVGGraphicsElement,
  pointerId: number,
): void {
  try {
    element.setPointerCapture?.(pointerId);
  } catch {
    // Browser test runners can synthesize pointer events without active capture.
  }
}

function safelyReleasePointerCapture(
  element: SVGGraphicsElement,
  pointerId: number,
): void {
  try {
    if (element.hasPointerCapture?.(pointerId)) {
      element.releasePointerCapture?.(pointerId);
    }
  } catch {
    // Matching the guarded setPointerCapture path above.
  }
}
