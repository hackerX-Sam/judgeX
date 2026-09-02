import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
}) => {
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
            const currentVal = Math.floor(end * (1 - Math.pow(2, -10 * progress)));
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

  return (
    <span ref={elementRef} className="animated-counter">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
