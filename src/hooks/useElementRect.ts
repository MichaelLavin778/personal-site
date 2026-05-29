import { type RefObject, useLayoutEffect, useState } from 'react';

export type ElementRect = {
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
};

const emptyRect: ElementRect = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
};

const readRect = (element: Element): ElementRect => {
    const rect = element.getBoundingClientRect();

    return {
        top: Math.ceil(rect.top),
        right: Math.ceil(rect.right),
        bottom: Math.ceil(rect.bottom),
        left: Math.floor(rect.left),
        width: Math.floor(rect.width),
        height: Math.ceil(rect.height),
    };
};

const areRectsEqual = (a: ElementRect, b: ElementRect) =>
    a.top === b.top &&
    a.right === b.right &&
    a.bottom === b.bottom &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height;

export const useElementRect = <T extends Element>(ref: RefObject<T | null>) => {
    const [rect, setRect] = useState<ElementRect>(emptyRect);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        const measure = () => {
            const nextRect = readRect(element);
            setRect((prev) => (areRectsEqual(prev, nextRect) ? prev : nextRect));
        };

        measure();

        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(element);
        window.addEventListener('resize', measure);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [ref]);

    return rect;
};
