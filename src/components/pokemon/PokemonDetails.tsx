import { Box, Grid, Stack, Typography } from "@mui/material";
import { useRef } from "react";
import { useElementRect } from "../../hooks/useElementRect";
import type { Pokemon } from "../../model/Pokemon";
import FullPaper from "../FullPaper";
import Abilities from "./Abilities";
import Cries from "./Cries";
import Moves from "./Moves";
import SpriteCard from "./SpriteCard";
import SpriteImage from "./SpriteImage";
import Stats from "./Stats";
import Type from "./Type";

type PokemonProps = {
    pokemon: Pokemon;
}

const PokemonDetails = ({ pokemon }: PokemonProps) => {
    // purpose of tracking this is to make right col the same height as the left
    const leftColRef = useRef<HTMLDivElement>(null);
    const leftColumnRect = useElementRect(leftColRef);

    // hide until pokemon is loaded
    if (!pokemon) return null;

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
                width:'100%'
            }}
            aria-hidden
        >
            <span>{symbol}</span>
        </Box>
    );

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
    const isFemaleOverride = femaleOverride.includes(pokemon.name);
    if (gender === 'male' || (gender === 'both' && hasAnyFemaleSprites)) {
        backgroundMaleOrDefault = maleBlue;
        showMaleSymbol = true;
    } else if (isFemaleOverride) {
        // some pokemon that are female only are labeled as genderless while using the male sprite slot
        backgroundMaleOrDefault = femalePink;
        showFemaleSymbol = true;
    }
    else if (gender === 'both')
        backgroundMaleOrDefault = `linear-gradient(135deg, ${maleBlue} 0%, ${maleBlue} calc(50% - 1px), rgba(128, 128, 128, 0.5) 50%, ${femalePink} calc(50% + 1px), ${femalePink} 100%)`;

    return (
        <Grid container={true} spacing={2} alignItems="flex-start">
            {/* Sprites */}
            <Grid size={12} textAlign="center" alignContent="center" sx={{ minHeight: 104 }}>
                {/* Male / Male+Female Sprite */}
                {hasAnyMaleDefaultSprites && (
                    <SpriteCard background={backgroundMaleOrDefault}>
                        <SpriteImage src={pokemon.sprites?.front_default || undefined} alt={pokemon.name} />
                        {showMaleSymbol && cardSymbol('♂', 'self-start')}
                        {showFemaleSymbol && cardSymbol('♀', 'self-start')}
                        <SpriteImage src={pokemon.sprites?.back_default || undefined} alt={`${pokemon.name} back`} />
                    </SpriteCard>
                )}
                {/* Shiny Sprite */}
                {hasAnyShinySprites && (
                    <SpriteCard background={backgroundMaleOrDefault}>
                        <SpriteImage src={pokemon.sprites?.front_shiny || undefined} alt={`${pokemon.name} shiny`} />
                        {showMaleSymbol && cardSymbol('♂', 'self-start')}
                        {showFemaleSymbol && cardSymbol('♀', 'self-start')}
                        {cardSymbol('✨', 'self-end')}
                        <SpriteImage src={pokemon.sprites?.back_shiny || undefined} alt={`${pokemon.name} shiny back`} />
                    </SpriteCard>
                )}
                {/* Female Sprite */}
                {hasAnyFemaleDefaultSprites && (
                    <SpriteCard background={femalePink}>
                        <SpriteImage src={pokemon.sprites?.front_female || undefined} alt={`${pokemon.name} female`} />
                        {cardSymbol('♀', 'self-start')}
                        <SpriteImage src={pokemon.sprites?.back_female || undefined} alt={`${pokemon.name} female back`} />
                    </SpriteCard>
                )}
                {/* Female Shiny Sprite */}
                {hasAnyFemaleShinySprites && (
                    <SpriteCard background={femalePink}>
                        <SpriteImage src={pokemon.sprites?.front_shiny_female || undefined} alt={`${pokemon.name} shiny female`} />
                        {cardSymbol('♀', 'self-start')}
                        {cardSymbol('✨', 'self-end')}
                        <SpriteImage src={pokemon.sprites?.back_shiny_female || undefined} alt={`${pokemon.name} shiny female back`} />
                    </SpriteCard>
                )}
            </Grid>

            {/* Left column */}
            <Grid size={{ md: 12, lg: 5 }} ref={leftColRef}>
                <FullPaper>
                    <Grid container={true} spacing={1}>
                        {/* Type(s) */}
                        <Grid size={6}>
                            <>
                                <Box>
                                    <Typography component="label" variant="caption" color="textSecondary">Type</Typography>
                                </Box>
                                {pokemon.types && pokemon.types.length > 0 ? (
                                    <Stack direction="row" spacing={1}>
                                        {pokemon.types.map(t => <Type key={t.type.name} typeName={t.type.name} />)}
                                    </Stack>
                                ) : '-'}
                            </>
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
                                    <Typography component="label" variant="caption" color="textSecondary">Base Experience</Typography>
                                </Box>
                                <Typography>{pokemon.base_experience ?? '-'}</Typography>
                            </>
                        </Grid>
                        {/* Height */}
                        <Grid size={4}>
                            <>
                                <Box>
                                    <Typography component="label" variant="caption" color="textSecondary">Height</Typography>
                                </Box>
                                <Typography>{pokemon.height ? pokemon.height / 10 : '-'} m</Typography>
                            </>
                        </Grid>
                        {/* Weight */}
                        <Grid size={4}>
                            <>
                                <Box>
                                    <Typography component="label" variant="caption" color="textSecondary">Weight</Typography>
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
