import { type PointerEvent as ReactPointerEvent, useCallback, useRef } from "react";

type SwipeStart = {
    pointerId: number;
    x: number;
    y: number;
};

type UseHorizontalSwipeNavigationArgs = {
    canNavigate: boolean;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    minDistance?: number;
};

const defaultMinDistance = 60;
const swipeThrottleMs = 250;

export const useHorizontalSwipeNavigation = ({
    canNavigate,
    onSwipeLeft,
    onSwipeRight,
    minDistance = defaultMinDistance,
}: UseHorizontalSwipeNavigationArgs) => {
    const swipeStartRef = useRef<SwipeStart | null>(null);
    const lastSwipeNavAtRef = useRef(0);

    const releasePointerCapture = useCallback((event: ReactPointerEvent<HTMLElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
    }, []);

    const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
        if (!canNavigate || !event.isPrimary || event.pointerType === 'mouse') return;

        swipeStartRef.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    }, [canNavigate]);

    const onPointerUp = useCallback((event: ReactPointerEvent<HTMLElement>) => {
        const swipeStart = swipeStartRef.current;
        if (!swipeStart || swipeStart.pointerId !== event.pointerId) return;

        swipeStartRef.current = null;
        releasePointerCapture(event);
        if (!canNavigate) return;

        const deltaX = event.clientX - swipeStart.x;
        const deltaY = event.clientY - swipeStart.y;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX < minDistance || absX < absY * 1.25) return;

        const now = Date.now();
        if (now - lastSwipeNavAtRef.current < swipeThrottleMs) return;

        lastSwipeNavAtRef.current = now;
        if (deltaX < 0)
            onSwipeLeft();
        else
            onSwipeRight();
    }, [canNavigate, minDistance, onSwipeLeft, onSwipeRight, releasePointerCapture]);

    const onPointerCancel = useCallback((event: ReactPointerEvent<HTMLElement>) => {
        if (swipeStartRef.current?.pointerId !== event.pointerId) return;

        swipeStartRef.current = null;
        releasePointerCapture(event);
    }, [releasePointerCapture]);

    const onLostPointerCapture = useCallback((event: ReactPointerEvent<HTMLElement>) => {
        if (swipeStartRef.current?.pointerId === event.pointerId)
            swipeStartRef.current = null;
    }, []);

    return {
        onPointerDown,
        onPointerUp,
        onPointerCancel,
        onLostPointerCapture,
    };
};
