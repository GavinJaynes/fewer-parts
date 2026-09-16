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

// The march is the expensive part of the hero, and how expensive depends
// entirely on the GPU: a low-end integrated part can be an order of magnitude
// off a discrete one. Rather than pick a setting that is either soft everywhere
// or slow somewhere, start optimistic and step down when frames keep arriving
// late. `quality` drives the number of raymarch slots in the shader.
const qualitySteps = [1, 0.55, 0.15] as const;
// The loop asks for 30fps. Sustained frames this far past that budget mean the
// march is what is in the way, not the browser.
const slowFrameMs = 46;
const framesPerVerdict = 45;

export async function mountCloudHero(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>("[data-cloud-canvas]");
  if (!canvas || !("gpu" in navigator)) {
    root.dataset.renderer = "fallback";
    return () => undefined;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");
  let disposed = false;
  let visible = true;
  let scroll = 0;
  let loop: FrameLoopHandle | undefined;
  let removeResizeListener: () => void = () => undefined;

  const gpu = await init();

  try {
    const output = surface(gpu, canvas, {
      dpr: coarsePointer.matches ? 0.72 : 0.75,
      label: "Above the clouds hero",
    });
    let qualityStep = coarsePointer.matches ? 1 : 0;
    const scene = effect(gpu, cloudShader, {
      label: "Cloud atmosphere",
      set: {
        params: {
          quality: qualitySteps[qualityStep],
          reduced_motion: reduceMotion.matches ? 1 : 0,
          resolution: [canvas.clientWidth, canvas.clientHeight],
          scroll: 0,
          time: 0,
        },
      },
    });
    const startedAt = performance.now();
    let firstFrame = true;
    let lastFrameAt = 0;
    let frameCount = 0;
    let frameTotal = 0;

    const observeFrameCost = (now: number) => {
      const previous = lastFrameAt;
      lastFrameAt = now;
      // A long gap means the loop was parked (hidden tab, scrolled away), not
      // that the GPU is struggling, so it should not count against quality.
      if (previous === 0 || now - previous > 400) {
        return;
      }

      frameTotal += now - previous;
      frameCount += 1;
      if (frameCount < framesPerVerdict) {
        return;
      }

      const average = frameTotal / frameCount;
      frameCount = 0;
      frameTotal = 0;
      if (average <= slowFrameMs || qualityStep >= qualitySteps.length - 1) {
        return;
      }

      qualityStep += 1;
      scene.set({ params: { quality: qualitySteps[qualityStep] } });
    };

    const updateScroll = () => {
      const rect = root.getBoundingClientRect();
      scroll = clamp(-rect.top / Math.max(rect.height * 0.72, 1));
      root.style.setProperty("--hero-progress", scroll.toFixed(3));
    };

    const render = (currentFrame = frame(gpu)) => {
      const now = performance.now();
      if (!reduceMotion.matches) {
        observeFrameCost(now);
      }
      const elapsed = reduceMotion.matches
        ? 0
        : ((now - startedAt) / 1000) % 3600;

      scene.set({
        params: {
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
      lastFrameAt = 0;
    };

    const startLoop = () => {
      if (disposed || loop || !visible || document.hidden) return;
      if (reduceMotion.matches) {
        render();
        return;
      }
      loop = frameLoop(gpu, render, { fps: 30 });
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
    document.addEventListener("visibilitychange", handleVisibility);
    reduceMotion.addEventListener("change", handleMotionChange);
    startLoop();

    return () => {
      disposed = true;
      stopLoop();
      observer.disconnect();
      removeResizeListener();
      window.removeEventListener("scroll", updateScroll);
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
