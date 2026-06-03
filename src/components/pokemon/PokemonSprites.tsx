import { Box, Grid } from "@mui/material";
import type { PokemonVariant } from "../../model/PokemonVariant";
import SpriteBlock from "./SpriteBlock";

type PokemonSpritesProps = {
    pokemon: PokemonVariant;
}

const PokemonSprites = ({ pokemon }: PokemonSpritesProps) => {
    const name = pokemon.name;
    const gender = pokemon.gender;

    // determine which sprites are available
    const hasAnyMaleDefaultSprites =
        !!pokemon.sprites?.front_default ||
        !!pokemon.sprites?.back_default;
    const hasAnyShinySprites =
        !!pokemon.sprites?.front_shiny ||
        !!pokemon.sprites?.back_shiny;
    const hasAnyFemaleDefaultSprites =
        !!pokemon.sprites?.front_female ||
        !!pokemon.sprites?.back_female;
    const hasAnyFemaleShinySprites =
        !!pokemon.sprites?.front_shiny_female ||
        !!pokemon.sprites?.back_shiny_female;
    const hasAnyFemaleSprites = hasAnyFemaleDefaultSprites || hasAnyFemaleShinySprites;

    // background color for sprite cards
    const maleBlue = 'rgba(108, 160, 220, 0.3)';
    const femalePink = 'rgba(248, 185, 212, 0.5)';
    const genderlessGray = 'rgba(192, 192, 192, 0.3)';
    let backgroundMaleOrDefault = genderlessGray;
    let showMaleSymbol = false;
    let showFemaleSymbol = false;
    const femaleOverride = [
        "pikachu-cosplay",
        "pikachu-rock-star",
        "pikachu-belle",
        "pikachu-pop-star",
        "pikachu-phd",
        "pikachu-libre",
    ];
    const isFemaleOverride = femaleOverride.includes(name);
    if (gender === 'male' || (gender === 'both' && hasAnyFemaleSprites)) {
        backgroundMaleOrDefault = maleBlue;
        showMaleSymbol = true;
    } else if (isFemaleOverride) {
        // some pokemon that are female only are labeled as genderless while using the male sprite slot
        backgroundMaleOrDefault = femalePink;
        showFemaleSymbol = true;
    } else if (gender === 'both')
        backgroundMaleOrDefault = `linear-gradient(135deg, ${maleBlue} 0%, ${maleBlue} calc(50% - 1px), rgba(128, 128, 128, 0.5) 50%, ${femalePink} calc(50% + 1px), ${femalePink} 100%)`;

    const spriteCardCount = [
        hasAnyMaleDefaultSprites,
        hasAnyShinySprites,
        hasAnyFemaleDefaultSprites,
        hasAnyFemaleShinySprites,
    ].filter(Boolean).length;
    const compactSprites = spriteCardCount > 2;

    return (
        <Grid
            size={12}
            textAlign="center"
            alignContent="center"
            sx={{
                minHeight: 104,
                '@media (max-width:447px)': {
                    minHeight: 204,
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 1,
                    width: '100%',
                }}
            >
                {/* Male / Male+Female Sprite */}
                {hasAnyMaleDefaultSprites && (
                    <SpriteBlock
                        background={backgroundMaleOrDefault}
                        compact={compactSprites}
                        name={name}
                        showFemaleSymbol={showFemaleSymbol}
                        showMaleSymbol={showMaleSymbol}
                        spriteBack={pokemon.sprites?.back_default || undefined}
                        spriteFront={pokemon.sprites?.front_default || undefined}
                    />
                )}
                {/* Shiny Sprite */}
                {hasAnyShinySprites && (
                    <SpriteBlock
                        background={backgroundMaleOrDefault}
                        compact={compactSprites}
                        name={name}
                        showFemaleSymbol={showFemaleSymbol}
                        showMaleSymbol={showMaleSymbol}
                        showShinySymbol={true}
                        spriteBack={pokemon.sprites?.back_shiny || undefined}
                        spriteFront={pokemon.sprites?.front_shiny || undefined}
                    />
                )}
                {/* Female Sprite */}
                {hasAnyFemaleDefaultSprites && (
                    <SpriteBlock
                        background={femalePink}
                        compact={compactSprites}
                        name={name}
                        showFemaleSymbol={true}
                        showMaleSymbol={false}
                        spriteBack={pokemon.sprites?.back_female || undefined}
                        spriteFront={pokemon.sprites?.front_female || undefined}
                    />
                )}
                {/* Female Shiny Sprite */}
                {hasAnyFemaleShinySprites && (
                    <SpriteBlock
                        background={femalePink}
                        compact={compactSprites}
                        name={name}
                        showFemaleSymbol={true}
                        showMaleSymbol={false}
                        showShinySymbol={true}
                        spriteBack={pokemon.sprites?.back_shiny_female || undefined}
                        spriteFront={pokemon.sprites?.front_shiny_female || undefined}
                    />
                )}
            </Box>
        </Grid>
    );
};

export default PokemonSprites;
