import {
  effect,
  frame,
  frameLoop,
  init,
  surface,
  type FrameLoopHandle,
} from "vgpu";
import cloudShader from "../shaders/clouds.wgsl";

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(Math.max(value, minimum), maximum);

export async function mountCloudHero(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>("[data-cloud-canvas]");
  if (!canvas || !("gpu" in navigator)) {
    root.dataset.renderer = "fallback";
    return () => undefined;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");
  const pointer = { currentX: 0, currentY: 0, targetX: 0, targetY: 0 };
  let disposed = false;
  let visible = true;
  let scroll = 0;
  let loop: FrameLoopHandle | undefined;
  let removeResizeListener: () => void = () => undefined;

  const gpu = await init();

  try {
    const output = surface(gpu, canvas, {
      dpr: coarsePointer.matches ? 0.7 : 0.82,
      label: "Above the clouds hero",
    });
    const scene = effect(gpu, cloudShader, {
      label: "Cloud atmosphere",
      set: {
        params: {
          pointer: [0, 0],
          quality: coarsePointer.matches ? 0.88 : 1,
          reduced_motion: reduceMotion.matches ? 1 : 0,
          resolution: [canvas.clientWidth, canvas.clientHeight],
          scroll: 0,
          time: 0,
        },
      },
    });
    const startedAt = performance.now();
    let firstFrame = true;

    const updateScroll = () => {
      const rect = root.getBoundingClientRect();
      scroll = clamp(-rect.top / Math.max(rect.height * 0.72, 1));
      root.style.setProperty("--hero-progress", scroll.toFixed(3));
    };

    const render = (currentFrame = frame(gpu)) => {
      pointer.currentX += (pointer.targetX - pointer.currentX) * 0.045;
      pointer.currentY += (pointer.targetY - pointer.currentY) * 0.045;
      const elapsed = reduceMotion.matches
        ? 0
        : ((performance.now() - startedAt) / 1000) % 3600;

      scene.set({
        params: {
          pointer: [pointer.currentX, pointer.currentY],
          reduced_motion: reduceMotion.matches ? 1 : 0,
          scroll,
          time: elapsed,
        },
      });

      if (currentFrame === undefined) return;
      currentFrame.pass(output, scene);
      if ("submit" in currentFrame) currentFrame.submit();

      if (firstFrame) {
        firstFrame = false;
        root.dataset.renderer = "webgpu";
      }
    };

    const stopLoop = () => {
      loop?.stop();
      loop = undefined;
    };

    const startLoop = () => {
      if (disposed || loop || !visible || document.hidden) return;
      if (reduceMotion.matches) {
        render();
        return;
      }
      loop = frameLoop(gpu, render, { fps: 30 });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (reduceMotion.matches) return;
      const rect = root.getBoundingClientRect();
      pointer.targetX =
        clamp((event.clientX - rect.left) / rect.width, 0, 1) * 2 - 1;
      pointer.targetY =
        (clamp((event.clientY - rect.top) / rect.height, 0, 1) * 2 - 1) * -1;
    };

    const handlePointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };

    const handleVisibility = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    const handleMotionChange = () => {
      stopLoop();
      startLoop();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible) startLoop();
        else stopLoop();
      },
      { rootMargin: "120px 0px" }
    );

    removeResizeListener = output.onResize(({ width, height }) => {
      scene.set({ params: { resolution: [width, height] } });
    });
    updateScroll();
    observer.observe(root);
    window.addEventListener("scroll", updateScroll, { passive: true });
    root.addEventListener("pointermove", handlePointerMove, { passive: true });
    root.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibility);
    reduceMotion.addEventListener("change", handleMotionChange);
    startLoop();

    return () => {
      disposed = true;
      stopLoop();
      observer.disconnect();
      removeResizeListener();
      window.removeEventListener("scroll", updateScroll);
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
      reduceMotion.removeEventListener("change", handleMotionChange);
      gpu.dispose();
    };
  } catch (error) {
    gpu.dispose();
    root.dataset.renderer = "fallback";
    throw error;
  }
}
