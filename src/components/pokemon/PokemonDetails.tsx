import { makeStyles } from "@material-ui/core";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import type { Pokemon } from "../../model/Pokemon";
import Abilities from "./Abilities";
import Cries from "./Cries";
import Moves from "./Moves";
import Stats from "./Stats";
import Type from "./Type";

const useStyles = makeStyles(() => ({
    gridContainer: {
        alignItems: 'flex-start'
    },
    spritesContainer: {
        textAlign: 'center',
        alignContent: 'center',
        minHeight: 106
    }
}));

type PokemonProps = {
    pokemon: Pokemon;
}

const PokemonDetails = ({ pokemon }: PokemonProps) => {
    const classes = useStyles();
    // purpose of tracking this is to make right col the same height as the left
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    const handleResize = () => {
        setWindowWidth(window.innerWidth);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setHeight(ref.current?.clientHeight ?? 0);
    }, [ref, windowWidth]);

    if (!pokemon) {
        return null;
    }

    return (
        <Grid container={true} spacing={3} className={classes.gridContainer}>
            <Grid size={12} className={classes.spritesContainer}>
                <img src={pokemon.sprites?.front_default || undefined} alt={pokemon.name} />
                {!!pokemon.sprites?.back_default && <img src={pokemon.sprites.back_default} />}
                {!!pokemon.sprites?.front_female && <img src={pokemon.sprites.front_female} />}
                {!!pokemon.sprites?.back_shiny_female && <img src={pokemon.sprites.back_shiny_female} />}
                {!!pokemon.sprites?.front_shiny && <img src={pokemon.sprites.front_shiny} />}
                {!!pokemon.sprites?.back_shiny && <img src={pokemon.sprites.back_shiny} />}
                {!!pokemon.sprites?.front_shiny_female && <img src={pokemon.sprites.front_shiny_female} />}
                {!!pokemon.sprites?.back_shiny_female && <img src={pokemon.sprites.back_shiny_female} />}
            </Grid>

            <Grid container={true} size={6} spacing={3} ref={ref}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <>
                        <Box>
                            <Typography component="label" variant="caption" color="textSecondary">Type</Typography>
                        </Box>
                        {pokemon.types && pokemon.types.length > 0 ? (
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                {pokemon.types.map(t => <Type key={t.type.name} typeName={t.type.name} />)}
                            </Stack>
                        ) : '-'}
                    </>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Abilities abilities={pokemon.abilities} />
                </Grid>

                <Grid size={12}>
                    <Stats stats={pokemon.stats} />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <>
                        <Box>
                            <Typography component="label" variant="caption" color="textSecondary">Base Experience</Typography>
                        </Box>
                        <Typography>{pokemon.base_experience ?? '-'}</Typography>
                    </>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <>
                        <Box>
                            <Typography component="label" variant="caption" color="textSecondary">Height</Typography>
                        </Box>
                        <Typography>{pokemon.height ? pokemon.height / 10 : '-'} m</Typography>
                    </>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <>
                        <Box>
                            <Typography component="label" variant="caption" color="textSecondary">Weight</Typography>
                        </Box>
                        <Typography>{pokemon.weight ? pokemon.weight / 10 : '-'} kg</Typography>
                    </>
                </Grid>

                <Grid size={12}>
                    <Cries cries={pokemon.cries} />
                </Grid>
            </Grid>
            <Grid size={6}>
                <Moves moves={pokemon.moves} leftColumnHeight={height} />
            </Grid>
        </Grid>
    );
};

export default PokemonDetails;