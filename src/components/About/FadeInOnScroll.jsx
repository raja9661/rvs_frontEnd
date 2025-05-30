import React, { useRef, useEffect, useState } from 'react';

const FadeInOnScroll = ({ children, delay = 0, direction = 'up' }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Set transform class based on direction
  const getInitialTransform = () => {
    switch (direction) {
      case 'left':
        return 'translate-x-[-100px]';
      case 'right':
        return 'translate-x-[100px]';
      case 'up':
        return 'translate-y-[100px]';
      case 'down':
        return 'translate-y-[-100px]';
      default:
        return '';
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0,
        rootMargin: '0px 0px -10% 0px', // top, right, bottom, left
        }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`
        transition-opacity transition-transform duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${getInitialTransform()}`}
      `}
    >
      {children}
    </div>
  );
};

export default FadeInOnScroll;
