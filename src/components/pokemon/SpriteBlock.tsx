import { Box } from "@mui/material";
import SpriteCard from "./SpriteCard";
import SpriteImage from "./SpriteImage";

// control for card symbols like shiny and male
const cardSymbol = (symbol: string, alignSelf: string) => (
    <Box
        component="span"
        sx={{
            position: 'absolute',
            alignSelf,
            justifySelf: 'center',
            fontSize: 16,
            pointerEvents: 'none',
            zIndex: 1,
            textShadow: '0 0 1px rgba(0,0,0,0.45)',
            width: '100%'
        }}
        aria-hidden
    >
        <span>{symbol}</span>
    </Box>
);

type SpriteBlockProps = {
    background: string;
    compact: boolean;
    name: string;
    showFemaleSymbol: boolean;
    showMaleSymbol: boolean;
    spriteBack: string | undefined;
    spriteFront: string | undefined;
}

const SpriteBlock = ({
    background,
    compact,
    name,
    showFemaleSymbol,
    showMaleSymbol,
    spriteBack,
    spriteFront,
}: SpriteBlockProps) => (
        <SpriteCard background={background} compact={compact}>
            <SpriteImage
                compact={compact}
                src={spriteFront || undefined}
                alt={name}
            />
            {showMaleSymbol && cardSymbol('♂', 'self-start')}
            {showFemaleSymbol && cardSymbol('♀', 'self-start')}
            <SpriteImage
                compact={compact}
                src={spriteBack || undefined}
                alt={`${name} back`}
            />
        </SpriteCard>
    );

export default SpriteBlock;
