/**
 * The recipe sub-nav collapses into a horizontal strip below 1000px, and a
 * strip that scrolls has to say so. The saying-so is pure CSS: a scroll-driven
 * animation drives a mask whose fade only grows on the side that still has
 * list hidden past it - see the `rail-fade-*` keyframes on the recipe page.
 * That leaves this module the one affordance CSS cannot express, which is
 * dragging the strip with a pointer - the thing a mouse is left with once the
 * scrollbar it used to grab is gone.
 *
 * Touch is deliberately not handled here. A finger already swipes an overflow
 * container, with the platform's own momentum and rubber-banding; intercepting
 * that to reimplement both in JavaScript would be strictly worse than leaving
 * it alone. So the pointer handlers ignore everything that is not a mouse.
 */

/**
 * Movement, in px, before a press stops being a click and becomes a drag.
 */
const dragThreshold = 4;

/**
 * Share of its velocity the glide keeps per 60fps frame once the pointer
 * lets go, and the px/ms below which it has nothing left to show.
 */
const glideFriction = 0.94;
const restVelocity = 0.02;

/**
 * Longest frame the glide will integrate, so a tab that stalled and came back
 * resumes rather than lurching the width of the pause.
 */
const maxFrameMs = 32;

const clamp = (value: number, maximum: number) =>
  Math.min(Math.max(value, 0), maximum);

const overflowOf = (rail: HTMLElement) =>
  Math.max(rail.scrollWidth - rail.clientWidth, 0);

export const mountDragRail = (rail: HTMLElement): (() => void) => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // One controller for the five listeners below, so the teardown cannot drift
  // out of step with the registrations the way a hand-paired list does.
  const listeners = new AbortController();
  const { signal } = listeners;

  let pointerId: number | null = null;
  let startX = 0;
  let startScroll = 0;
  let lastX = 0;
  let lastStamp = 0;
  let velocity = 0;
  let isDragging = false;
  let shouldSwallowClick = false;
  let glide = 0;

  /**
   * The grab cursor is a promise that dragging will do something, so it hangs
   * off the fact of overflow rather than off the breakpoint. A strip short
   * enough to fit - or the sticky column above 1000px, which is not a strip at
   * all - never claims to be draggable.
   */
  const syncOverflow = () => {
    rail.toggleAttribute("data-overflowing", overflowOf(rail) > 1);
  };

  const stopGlide = () => {
    cancelAnimationFrame(glide);
    glide = 0;
  };

  const startGlide = () => {
    let last = performance.now();

    const step = (now: number) => {
      const elapsed = Math.min(now - last, maxFrameMs);
      last = now;
      velocity *= glideFriction ** (elapsed / (1000 / 60));

      if (Math.abs(velocity) < restVelocity) {
        return;
      }

      const next = clamp(
        rail.scrollLeft - velocity * elapsed,
        overflowOf(rail)
      );
      // Landing on the value it already had means an end was reached, and
      // there is no bounce to play out.
      if (next === rail.scrollLeft) {
        return;
      }

      rail.scrollLeft = next;
      glide = requestAnimationFrame(step);
    };

    glide = requestAnimationFrame(step);
  };

  const onPointerDown = (event: PointerEvent) => {
    // Whatever the last interaction left behind is settled here rather than on
    // its way out: a drag released outside the strip never fires the click it
    // armed us to swallow, and that swallow must not survive to eat this one.
    shouldSwallowClick = false;
    stopGlide();

    if (
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      overflowOf(rail) < 1
    ) {
      return;
    }

    const { clientX, pointerId: id, timeStamp } = event;
    pointerId = id;
    startX = clientX;
    lastX = clientX;
    startScroll = rail.scrollLeft;
    lastStamp = timeStamp;
    velocity = 0;
    isDragging = false;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (pointerId === null || event.pointerId !== pointerId) {
      return;
    }

    const { clientX, timeStamp } = event;
    const travelled = clientX - startX;

    if (!isDragging) {
      if (Math.abs(travelled) < dragThreshold) {
        return;
      }
      isDragging = true;
      rail.setAttribute("data-dragging", "");
      // The press began as an ordinary mousedown, so by now the browser may
      // have started selecting a link label. Drop it rather than drag it.
      document.getSelection()?.removeAllRanges();
      rail.setPointerCapture(pointerId);
    }

    const elapsed = timeStamp - lastStamp;
    if (elapsed > 0) {
      velocity = (clientX - lastX) / elapsed;
    }
    lastX = clientX;
    lastStamp = timeStamp;

    rail.scrollLeft = clamp(startScroll - travelled, overflowOf(rail));
  };

  const onPointerUp = (event: PointerEvent) => {
    if (pointerId === null || event.pointerId !== pointerId) {
      return;
    }

    if (rail.hasPointerCapture(pointerId)) {
      rail.releasePointerCapture(pointerId);
    }
    pointerId = null;

    if (!isDragging) {
      return;
    }

    isDragging = false;
    rail.removeAttribute("data-dragging");
    // A drag that finishes over a recipe link is still a mousedown and a
    // mouseup on that link, which is a click. Arm the capture listener below
    // to eat exactly one of them.
    shouldSwallowClick = true;

    if (!reduceMotion.matches && Math.abs(velocity) > restVelocity) {
      startGlide();
    }
  };

  const onClick = (event: MouseEvent) => {
    if (!shouldSwallowClick) {
      return;
    }
    shouldSwallowClick = false;
    event.preventDefault();
    event.stopPropagation();
  };

  // The strip's own box is what changes when the viewport does, so one
  // observer covers both the breakpoint and every resize either side of it.
  const observer = new ResizeObserver(syncOverflow);
  observer.observe(rail);

  rail.addEventListener("pointerdown", onPointerDown, { signal });
  rail.addEventListener("pointermove", onPointerMove, { signal });
  rail.addEventListener("pointerup", onPointerUp, { signal });
  rail.addEventListener("pointercancel", onPointerUp, { signal });
  rail.addEventListener("click", onClick, { capture: true, signal });
  syncOverflow();

  return () => {
    stopGlide();
    observer.disconnect();
    listeners.abort();
  };
};

/**
 * The page the reader is on should be visible in the strip without being
 * hunted for. scrollLeft is set directly rather than through scrollIntoView,
 * which would also walk up the tree and scroll the document itself.
 */
export const revealCurrent = (rail: HTMLElement) => {
  const current = rail.querySelector<HTMLElement>('[aria-current="page"]');
  if (current === null || overflowOf(rail) < 1) {
    return;
  }

  // Measured against the rail rather than read off offsetLeft, which is
  // relative to whichever ancestor happens to be positioned.
  const item = current.closest("li") ?? current;
  const railBox = rail.getBoundingClientRect();
  const itemBox = item.getBoundingClientRect();
  const centred =
    rail.scrollLeft +
    (itemBox.left - railBox.left) -
    (railBox.width - itemBox.width) / 2;

  rail.scrollLeft = clamp(centred, overflowOf(rail));
};
