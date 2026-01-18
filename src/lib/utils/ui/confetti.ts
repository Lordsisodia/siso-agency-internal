/**
 * Confetti Utility
 *
 * Provides celebration animations using canvas-confetti
 */

import confetti from 'canvas-confetti';

/**
 * Trigger a celebration confetti animation
 */
export const celebrate = ({
  particleCount = 100,
  spread = 70,
  origin = { y: 0.6 },
  colors,
}: {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
} = {}) => {
  const defaultColors = ['#26ffc6', '#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff'];

  confetti({
    particleCount,
    spread,
    origin,
    colors: colors || defaultColors,
    disableForReducedMotion: true,
    zIndex: 9999,
  });
};

/**
 * Trigger a side-cannon celebration (from left and right)
 */
export const celebrateSides = async () => {
  const defaults = {
    spread: 55,
    colors: ['#26ffc6', '#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff'],
  };

  const left = () => {
    confetti({
      ...defaults,
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
  };

  const right = () => {
    confetti({
      ...defaults,
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });
  };

  await left();
  await right();
};

/**
 * Trigger a school-pride style celebration (continuous burst)
 */
export const celebratePride = async () => {
  const end = Date.now() + 1000; // Celebrate for 1 second

  const colors = ['#26ffc6', '#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};

/**
 * Small celebration for quick feedback (like checking off a task)
 */
export const miniCelebrate = () => {
  celebrate({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
  });
};
