import { Box } from "@mui/material";

export const spriteSize = 96;

type SpriteImageProps = {
    alt: string;
    src: string | undefined;
}

const SpriteImage = ({ alt, src }: SpriteImageProps) => (
    <Box
        component="span"
        sx={{
            width: spriteSize,
            height: spriteSize,
            flex: `0 0 ${spriteSize}px`,
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
                    width: spriteSize,
                    height: spriteSize,
                    display: 'block',
                    objectFit: 'contain',
                }}
            />
        )}
    </Box>
);

export default SpriteImage;
