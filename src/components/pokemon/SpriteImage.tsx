import { Box } from "@mui/material";

export const spriteSize = 96;

type SpriteImageProps = {
    alt: string;
    src: string | undefined;
    compact?: boolean;
}

const SpriteImage = ({ alt, src, compact = false }: SpriteImageProps) => (
    <Box
        component="span"
        sx={{
            width: compact ? { xs: '50%', sm: spriteSize } : spriteSize,
            height: compact ? { xs: '100%', sm: spriteSize } : spriteSize,
            flex: compact ? { xs: '1 1 0', sm: `0 0 ${spriteSize}px` } : `0 0 ${spriteSize}px`,
            minWidth: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        {src && (
            <Box
                component="img"
                src={src}
                alt={alt}
                width={spriteSize}
                height={spriteSize}
                sx={{
                    width: compact ? { xs: '100%', sm: spriteSize } : spriteSize,
                    height: compact ? { xs: '100%', sm: spriteSize } : spriteSize,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    display: 'block',
                    objectFit: 'contain',
                }}
            />
        )}
    </Box>
);

export default SpriteImage;
