import { Box, Grid, Paper, type PaperProps, Stack, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import type { Pokemon } from "../../model/Pokemon";
import Abilities from "./Abilities";
import Cries from "./Cries";
import Moves from "./Moves";
import Stats from "./Stats";
import Type from "./Type";


type SpriteCardProps = {
    background: string;
    children: React.ReactNode;
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
            position: 'relative',
        }}
    >
        {children}
    </Box>
);

const FullPaper = ({ children, ...props }: PaperProps) => {
    const sx = props.sx || {};
    return (
        <Paper
            {...props}
            variant="elevation"
            sx={{
                p: 2,
                ...sx,
                // MUI "elevation" shadows are intentionally directional (drop-shadow style).
                // Override to make the shadow feel even on all sides.
                boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                        ? '0 0 4px rgba(0,0,0,0.65)'
                        : '0 0 4px rgba(0,0,0,0.22)',
            }}
            elevation={0}
            
        >
            {children}
        </Paper>
    );
};

type PokemonProps = {
    pokemon: Pokemon;
	genderlessPokemonNames?: string[];
}

const PokemonDetails = ({ pokemon, genderlessPokemonNames = [] }: PokemonProps) => {
    // purpose of tracking this is to make right col the same height as the left
    const [bottom, setBottom] = useState(0);
    const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);
    const leftColRef = useRef<HTMLDivElement>(null);
    const rightColRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const refBottom = leftColRef.current?.getBoundingClientRect().bottom;
        if (refBottom && pokemon.id) setBottom(refBottom);
    }, [leftColRef, pokemon, rightColRef, windowHeight]);

    // rerender on any window resizing
    const handleResize = () => {
        setWindowHeight(window.innerHeight);
    };
    useEffect(() => {
        window.addEventListener('resize', handleResize);
        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    // determine which sprites are available
    const hasAnyFemaleSprites =
        !!pokemon.sprites?.front_female ||
        !!pokemon.sprites?.back_female ||
        !!pokemon.sprites?.front_shiny_female ||
        !!pokemon.sprites?.back_shiny_female;
    const hasAnyShinySprites =
        !!pokemon.sprites?.front_shiny ||
        !!pokemon.sprites?.back_shiny;
    const hasAnyFemaleDefaultSprites =
        !!pokemon.sprites?.front_female ||
        !!pokemon.sprites?.back_female;
    const hasAnyFemaleShinySprites =
        !!pokemon.sprites?.front_shiny_female ||
        !!pokemon.sprites?.back_shiny_female;

    // background color for sprite cards
    const maleBlue = 'rgba(108, 160, 220, 0.3)';
    const femalePink = 'rgba(248, 185, 212, 0.5)';
    const genderlessGray = 'rgba(192, 192, 192, 0.3)';
    let background = genderlessGray;
    const maleOverride = ["nidoran-m", "nidorino", "nidoking"];
    const femaleOverride = ["nidoran-f", "nidorina", "nidoqueen"];
    if (!genderlessPokemonNames.includes(pokemon.name)) {
        if (hasAnyFemaleSprites || maleOverride.includes(pokemon.name)) 
            background = maleBlue;
        else if (femaleOverride.includes(pokemon.name))
            background = femalePink;
        else 
            background = `linear-gradient(135deg, ${maleBlue} 0%, ${maleBlue} calc(50% - 1px), rgba(128, 128, 128, 0.5) 50%, ${femalePink} calc(50% + 1px), ${femalePink} 100%)`;
        
    }

    return (
        <Grid container={true} spacing={2} alignItems="flex-start">
            {/* Sprites */}
            <Grid size={12} textAlign="center" alignContent="center">
                {/* Male / Male+Female Sprite */}
                <SpriteCard background={background}>
                    <img src={pokemon.sprites?.front_default || undefined} alt={pokemon.name} />
                    {hasAnyFemaleSprites && (
                        cardSymbol('♂', 'self-start')
                    )}
                    {!!pokemon.sprites?.back_default && (
                        <img src={pokemon.sprites.back_default} alt={`${pokemon.name} back`} />
                    )}
                </SpriteCard>
                {/* Shiny Sprite */}
                {hasAnyShinySprites && (
                    <SpriteCard background={background}>
                        {!!pokemon.sprites?.front_shiny && <img src={pokemon.sprites.front_shiny} />}
                        {hasAnyFemaleSprites && (
                            cardSymbol('♂', 'self-start')
                        )}
                        {cardSymbol('✨', 'self-end')}
                        {!!pokemon.sprites?.back_shiny && <img src={pokemon.sprites.back_shiny} />}
                    </SpriteCard>
                )}
                {/* Female Sprite */}
                {hasAnyFemaleDefaultSprites && (
                    <SpriteCard background={femalePink}>
                        {!!pokemon.sprites?.front_female && <img src={pokemon.sprites.front_female} />}
                        {cardSymbol('♀', 'self-start')}
                        {!!pokemon.sprites?.back_female && <img src={pokemon.sprites.back_female} />}
                    </SpriteCard>
                )}
                {/* Female Shiny Sprite */}
                {hasAnyFemaleShinySprites && (
                    <SpriteCard background={femalePink}>
                        {!!pokemon.sprites?.front_shiny_female && <img src={pokemon.sprites.front_shiny_female} />}
                        {cardSymbol('♀', 'self-start')}
                        {cardSymbol('✨', 'self-end')}
                        {!!pokemon.sprites?.back_shiny_female && <img src={pokemon.sprites.back_shiny_female} />}
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
                        <Grid size={6}>
                            <Abilities abilities={pokemon.abilities} />
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
            <Grid size={{ md: 12, lg: 7 }} ref={rightColRef}>
                <FullPaper>
                    {bottom > 0 && pokemon.moves?.length > 0 && <Moves moves={pokemon.moves} lefColBottom={bottom} />}
                </FullPaper>
            </Grid>
        </Grid>
    );
};

export default PokemonDetails;