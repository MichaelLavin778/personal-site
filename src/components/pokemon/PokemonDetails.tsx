import { Grid, InputLabel, Stack, Typography } from "@mui/material";
import type { Pokemon } from "../../model/Pokemon";
import Abilities from "./Abilities";
import Cries from "./Cries";
import Type from "./Type";
import Moves from "./Moves";
import Stats from "./Stats";

type PokemonProps = {
    pokemon: Pokemon;
}

const PokemonDetails = ({ pokemon }: PokemonProps) => {
    if (!pokemon) {
        return null;
    }

    return (
        <Grid container={true} sx={{ alignItems: 'flex-start' }}>
            <Grid size={12} sx={{ textAlign: 'center', alignContent: 'center', minHeight: 106 }}>
                <img src={pokemon.sprites?.front_default || undefined} alt={pokemon.name} />
                {!!pokemon.sprites?.back_default && <img src={pokemon.sprites.back_default} />}
                {!!pokemon.sprites?.front_female && <img src={pokemon.sprites.front_female} />}
                {!!pokemon.sprites?.back_shiny_female && <img src={pokemon.sprites.back_shiny_female} />}
                {!!pokemon.sprites?.front_shiny && <img src={pokemon.sprites.front_shiny} />}
                {!!pokemon.sprites?.back_shiny && <img src={pokemon.sprites.back_shiny} />}
                {!!pokemon.sprites?.front_shiny_female && <img src={pokemon.sprites.front_shiny_female} />}
                {!!pokemon.sprites?.back_shiny_female && <img src={pokemon.sprites.back_shiny_female} />}
            </Grid>

            <Grid container={true} size={6} spacing={2}>
                <Grid size={12}>
                    <>
                        <InputLabel>Type</InputLabel>
                        {pokemon.types && pokemon.types.length > 0 ? (
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                {pokemon.types.map(t => <Type key={t.type.name} typeName={t.type.name} />)}
                            </Stack>
                        ) : '-'}
                    </>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Stats stats={pokemon.stats} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Abilities abilities={pokemon.abilities} />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <>
                        <InputLabel>Base Experience</InputLabel>
                        <Typography>{pokemon.base_experience ?? '-'}</Typography>
                    </>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <>
                        <InputLabel>Height</InputLabel>
                        <Typography>{pokemon.height ? pokemon.height / 10 : '-'} m</Typography>
                    </>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <>
                        <InputLabel>Weight</InputLabel>
                        <Typography>{pokemon.weight ? pokemon.weight / 10 : '-'} kg</Typography>
                    </>
                </Grid>

                <Grid size={12}>
                    <Cries cries={pokemon.cries} />
                </Grid>
            </Grid>
            <Grid size={6}>
                <Moves moves={pokemon.moves} />
            </Grid>
        </Grid>
    );
};

export default PokemonDetails;