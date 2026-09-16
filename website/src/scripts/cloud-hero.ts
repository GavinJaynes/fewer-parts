import { effect, frame, frameLoop, init, surface } from "vgpu";
import cloudShader from "../shaders/clouds.wgsl";
import type { FrameLoopHandle } from "vgpu";

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

type Gpu = Awaited<ReturnType<typeof init>>;

/**
 * Handed back when there is no device to mount against, so every caller gets a
 * teardown to hold whether or not the hero ever started.
 */
const nothingToDispose = () => {
  // No scene was created, so no scene has to be taken down.
};

/**
 * Everything that happens once the device exists. It lives out here so that the
 * try in `mountCloudHero` wraps a single call rather than the whole scene, and
 * so the teardown it returns sits next to the things it tears down.
 */
const startScene = (
  gpu: Gpu,
  root: HTMLElement,
  canvas: HTMLCanvasElement
): (() => void) => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");
  // One controller for every listener registered below, so teardown is a single
  // abort() rather than a list that has to be kept in step with the additions.
  const listeners = new AbortController();
  const { signal } = listeners;

  let isDisposed = false;
  let isVisible = true;
  let loop: FrameLoopHandle | null = null;
  let stopWatchingResize: (() => void) | null = null;

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
  let isFirstFrame = true;
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

  const render = (currentFrame = frame(gpu)) => {
    const now = performance.now();
    if (!reduceMotion.matches) {
      observeFrameCost(now);
    }
    const elapsed = reduceMotion.matches
      ? 0
      : ((now - startedAt) / 1000) % 3600;

    // Measured here rather than from a scroll listener. The loop is already
    // running when this value can change, so one read per rendered frame
    // replaces one per scroll event - and does no work at all while the hero
    // is off screen, in a hidden tab, or held still by reduced motion.
    const box = root.getBoundingClientRect();

    scene.set({
      params: {
        reduced_motion: reduceMotion.matches ? 1 : 0,
        scroll: clamp(-box.top / Math.max(box.height * 0.72, 1)),
        time: elapsed,
      },
    });

    currentFrame.pass(output, scene);
    if ("submit" in currentFrame) {
      currentFrame.submit();
    }

    if (isFirstFrame) {
      isFirstFrame = false;
      root.dataset.renderer = "webgpu";
    }
  };

  const stopLoop = () => {
    loop?.stop();
    loop = null;
    lastFrameAt = 0;
  };

  const startLoop = () => {
    if (isDisposed || loop || !isVisible || document.hidden) {
      return;
    }
    if (reduceMotion.matches) {
      render();
      return;
    }
    loop = frameLoop(gpu, render, { fps: 30 });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      isVisible = entry.isIntersecting;
      if (isVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    },
    { rootMargin: "120px 0px" }
  );

  stopWatchingResize = output.onResize(({ width, height }) => {
    scene.set({ params: { resolution: [width, height] } });
  });
  observer.observe(root);

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    },
    { signal }
  );

  reduceMotion.addEventListener(
    "change",
    () => {
      stopLoop();
      startLoop();
    },
    { signal }
  );

  startLoop();

  return () => {
    isDisposed = true;
    stopLoop();
    observer.disconnect();
    stopWatchingResize?.();
    stopWatchingResize = null;
    listeners.abort();
    gpu.dispose();
  };
};

export const mountCloudHero = async function mountCloudHero(
  root: HTMLElement
): Promise<() => void> {
  const { dataset } = root;
  const canvas = root.querySelector<HTMLCanvasElement>("[data-cloud-canvas]");
  if (!canvas || !("gpu" in navigator)) {
    dataset.renderer = "fallback";
    return nothingToDispose;
  }

  const gpu = await init();

  try {
    return startScene(gpu, root, canvas);
  } catch (error) {
    gpu.dispose();
    dataset.renderer = "fallback";
    throw error;
  }
};
