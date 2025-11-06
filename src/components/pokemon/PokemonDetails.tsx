import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { IconButton, Typography } from "@mui/material";
// import { makeStyles } from "@material-ui/core";
import { useRef } from 'react';
import type { Pokemon } from "../../model/Pokemon";

// const useStyles = makeStyles(() => ({}));

type PokemonProps = {
    pokemon: Pokemon
}

const PokemonDetails = ({ pokemon }: PokemonProps) => {
    const audioLatestRef = useRef<HTMLAudioElement | null>(null);
    const audioLegacyRef = useRef<HTMLAudioElement | null>(null);

    if (!pokemon) {
        return null;
    }

    return (
        <>
            <img src={pokemon.sprites?.front_default || undefined} alt={pokemon.name} />
            {pokemon.types && pokemon.types.length > 0 && (
                <Typography>Type: {pokemon.types.map(t => t.type.name).join(', ')}</Typography>
            )}
            {pokemon.stats && pokemon.stats.length > 0 && (
                <Typography>Stats: {pokemon.stats.map(s => `${s.stat.name} (${s.base_stat})`).join(', ')}</Typography>
            )}
            {(pokemon.cries?.latest || pokemon.cries?.legacy) && <Typography component="span">Cries: </Typography>}
            {pokemon.cries?.latest && (
                <>
                    <audio ref={audioLatestRef} src={pokemon.cries.latest} preload="auto" />
                    <IconButton onClick={() => audioLatestRef.current?.play()}>
                        <PlayArrowIcon />
                    </IconButton>
                </>
            )}
            {pokemon.cries?.legacy && (
                <>
                    <audio ref={audioLegacyRef} src={pokemon.cries.legacy} preload="auto" />
                    <IconButton onClick={() => audioLegacyRef.current?.play()}>
                        <PlayArrowIcon />
                    </IconButton>
                </>
            )}
            {pokemon.abilities && pokemon.abilities.length > 0 && (
                <Typography>Abilities: {pokemon.abilities.map(ability => `${ability.ability.name}${ability.is_hidden ? ' (hidden)' : ''}`).join(', ')}</Typography>
            )}
            {pokemon.base_experience && <Typography>Base Experience - {pokemon.base_experience}</Typography>}
            {pokemon.species && <Typography>Species - {pokemon.species.name}</Typography>}
            {pokemon.height && <Typography>Height - {pokemon.height}</Typography>}
            {pokemon.weight && <Typography>Weight - {pokemon.weight}</Typography>}
            {pokemon.moves && pokemon.moves.length > 0 && (
                <Typography>Moves: {pokemon.moves.map(move => move.move.name).join(', ')}</Typography>
            )}
        </>
    );
};

export default PokemonDetails;