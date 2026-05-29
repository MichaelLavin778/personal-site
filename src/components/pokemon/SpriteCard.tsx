import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { spriteSize } from "./SpriteImage";

type SpriteCardProps = {
    background: string;
    children: ReactNode;
    compact?: boolean;
}

const SpriteCard = ({ background, children, compact = false }: SpriteCardProps) => (
    <Box
        component="span"
        sx={{
            background,
            borderRadius: 2,
            display: 'inline-flex',
            alignItems: 'center',
            border: '1px solid gray',
            boxSizing: 'border-box',
            flex: compact ? { xs: '1 1 calc(50% - 4px)', sm: '0 0 auto' } : '0 0 auto',
            width: compact ? { xs: 'calc(50% - 4px)', sm: 'auto' } : 'auto',
            maxWidth: compact ? { xs: spriteSize * 2, sm: 'none' } : 'none',
            minWidth: 0,
            minHeight: compact ? { xs: 0, sm: spriteSize } : spriteSize,
            aspectRatio: compact ? { xs: '2 / 1', sm: 'auto' } : 'auto',
            overflow: 'hidden',
            position: 'relative',
            verticalAlign: 'middle',
        }}
    >
        {children}
    </Box>
);

export default SpriteCard;
