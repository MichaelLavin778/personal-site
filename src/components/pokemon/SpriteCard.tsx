import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { spriteSize } from "./SpriteImage";

type SpriteCardProps = {
    background: string;
    children: ReactNode;
}

const SpriteCard = ({ background, children }: SpriteCardProps) => (
    <Box
        component="span"
        sx={{
            background,
            borderRadius: 2,
            display: 'inline-flex',
            alignItems: 'center',
            marginX: 0.5,
            border: '1px solid gray',
            minHeight: spriteSize,
            position: 'relative',
            verticalAlign: 'middle',
        }}
    >
        {children}
    </Box>
);

export default SpriteCard;
