import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { Box, ButtonBase, Grid, Stack, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { useElementRect } from "../../hooks/useElementRect";
import type { Pokemon, PokemonType } from "../../model/Pokemon";
import FullPaper from "../FullPaper";
import Abilities from "./Abilities";
import Cries from "./Cries";
import Moves from "./Moves";
import SpriteBlock from "./SpriteBlock";
import Stats from "./Stats";
import Type from "./Type";
import TypeModal from "./TypeModal";

type PokemonProps = {
    pokemon: Pokemon;
}

const PokemonDetails = ({ pokemon }: PokemonProps) => {
    // purpose of tracking this is to make right col the same height as the left
    const leftColRef = useRef<HTMLDivElement>(null);
    const leftColumnRect = useElementRect(leftColRef);
    const [typeModalTypes, setTypeModalTypes] = useState<PokemonType[] | null>(null);

    // hide until pokemon is loaded
    if (!pokemon) return null;

    const name = pokemon.name;
    const gender = pokemon.gender;
    const displayedTypes = pokemon.types?.slice(0, 2) ?? [];

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
        <Grid container={true} spacing={2} alignItems="flex-start">
            {/* Sprites */}
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

            {/* Left column */}
            <Grid size={{ md: 12, lg: 5 }} ref={leftColRef}>
                <FullPaper>
                    <Grid container={true} spacing={1}>
                        {/* Type(s) */}
                        <Grid size={6} sx={{ display: 'flex' }}>
                            <ButtonBase
                                aria-label={`Open type matchup info for ${displayedTypes.map(t => t.type.name).join(' and ')}`}
                                disabled={displayedTypes.length === 0}
                                onClick={() => setTypeModalTypes(displayedTypes)}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                    width: '100%',
                                    height: '100%',
                                    textAlign: 'left',
                                    transition: 'background-color 120ms ease, border-color 120ms ease, transform 120ms ease',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                        borderColor: 'primary.main',
                                        transform: 'translateY(-1px)',
                                    },
                                    '&.Mui-focusVisible': {
                                        outline: '2px solid',
                                        outlineColor: 'primary.main',
                                        outlineOffset: 2,
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Typography component="span" variant="caption" color="textSecondary">Type</Typography>
                                    <OpenInFullIcon sx={{ ml: 'auto', fontSize: '1rem', color: 'text.secondary' }} />
                                </Box>
                                {displayedTypes.length > 0 ? (
                                    <Stack direction="row" spacing={1} width="100%" alignItems="center">
                                        {displayedTypes.map(t => (
                                            <Type key={t.type.name} typeName={t.type.name} sx={{ flexShrink: 0 }} />
                                        ))}
                                    </Stack>
                                ) : '-'}
                            </ButtonBase>
                        </Grid>
                        {/* Abilities */}
                        <Grid size={6} sx={{ minHeight: 92 }}>
                            <Abilities pokemon={pokemon} />
                        </Grid>

                        {/* Stats chart */}
                        <Grid size={12}>
                            <Stats stats={pokemon.stats} />
                        </Grid>

                        {/* Other info */}
                        {/* Base exp */}
                        <Grid size={4}>
                            <>
                                <Box>
                                    <Typography component="span" variant="caption" color="textSecondary">Base Experience</Typography>
                                </Box>
                                <Typography>{pokemon.base_experience ?? '-'}</Typography>
                            </>
                        </Grid>
                        {/* Height */}
                        <Grid size={4}>
                            <>
                                <Box>
                                    <Typography component="span" variant="caption" color="textSecondary">Height</Typography>
                                </Box>
                                <Typography>{pokemon.height ? pokemon.height / 10 : '-'} m</Typography>
                            </>
                        </Grid>
                        {/* Weight */}
                        <Grid size={4}>
                            <>
                                <Box>
                                    <Typography component="span" variant="caption" color="textSecondary">Weight</Typography>
                                </Box>
                                <Typography>{pokemon.weight ? pokemon.weight / 10 : '-'} kg</Typography>
                            </>
                        </Grid>

                        {/* Cries */}
                        <Grid size={12}>
                            <Cries cries={pokemon.cries} />
                        </Grid>
                    </Grid>
                </FullPaper>
            </Grid>

            {typeModalTypes && (
                <TypeModal
                    initialTypes={typeModalTypes}
                    onClose={() => setTypeModalTypes(null)}
                />
            )}

            {/* Right column */}
            <Grid size={{ md: 12, lg: 7 }}>
                <FullPaper sx={{ minHeight: { lg: leftColumnRect.height || 'auto' } }}>
                    <Moves moves={pokemon.moves ?? []} lefColBottom={leftColumnRect.bottom} />
                </FullPaper>
            </Grid>
        </Grid>
    );
};

export default PokemonDetails;
