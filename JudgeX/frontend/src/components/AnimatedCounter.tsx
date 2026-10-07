import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals,
}) => {
  const isFloat = decimals !== undefined ? decimals > 0 : end % 1 !== 0;
  const numDecimals = decimals !== undefined ? decimals : isFloat ? 1 : 0;
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          let startTime: number | null = null;

          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease-out expo formula
            const currentVal = end * (1 - Math.pow(2, -10 * progress));
            setCount(currentVal);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [end, duration]);

  const formattedCount = numDecimals > 0 
    ? count.toFixed(numDecimals)
    : Math.floor(count).toLocaleString();

  return (
    <span ref={elementRef} className="animated-counter">
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
