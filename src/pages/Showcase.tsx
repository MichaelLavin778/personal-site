import { CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ShowcaseBody from "../components/pokemon/ShowcaseBody";
import ShowcaseContainer from "../components/pokemon/ShowcaseContainer";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { getGenerations, loadGenerations } from "../state/pokemonGenerationsSlice";
import { getPokemonList, loadPokemonList } from "../state/pokemonSlice";

const Showcase = () => {
    const dispatch = useAppDispatch();

    const pokemonList = useAppSelector(getPokemonList);
    const generations = useAppSelector(getGenerations);

    const [error, setError] = useState<Error | undefined>(undefined);

    const pokemonLoaded = pokemonList.length > 0;
	const generationsLoaded = generations.length > 0;
	const loaded = pokemonLoaded && generationsLoaded;

    // load list of pokemon and each pokemon info
    useEffect(() => {
        if (pokemonLoaded) return;

        dispatch(loadPokemonList())
            .unwrap()
            .catch((message) => {
                if ((message as Error)?.name !== 'ConditionError')
                    setError(new Error(String(message)));
            });
    }, [dispatch, pokemonLoaded]);

    // load generations for the generation selector
    useEffect(() => {
        if (generationsLoaded) return;

        dispatch(loadGenerations())
            .unwrap()
            .catch((message) => {
                if ((message as Error)?.name !== 'ConditionError')
                    setError(new Error(String(message)));
            });
    }, [dispatch, generationsLoaded]);

    // error display
    if (error) {
        return (
            <ShowcaseContainer>
                <Typography color="error">Error loading Pokémon: {error.message}</Typography>
            </ShowcaseContainer>
        );
    }

    // loading display
    if (!loaded)
        return <CircularProgress />

    return (
        <ShowcaseBody />
    );
};

export default Showcase;
