import { useEffect, useState } from 'react';

const readViewportSize = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
});

export const useViewportSize = () => {
    const [viewportSize, setViewportSize] = useState(readViewportSize);

    useEffect(() => {
        const handleResize = () => {
            const nextSize = readViewportSize();
            setViewportSize((prev) =>
                prev.width === nextSize.width && prev.height === nextSize.height ? prev : nextSize
            );
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return viewportSize;
};
