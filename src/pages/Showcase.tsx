import { Autocomplete, CircularProgress, Container, Paper, TextField, Typography } from "@mui/material";
import { makeStyles } from "@material-ui/core";
import { useEffect, useState } from "react";
import PokemonDetails from "../components/pokemon/PokemonDetails";
import { toTitleCase } from "../helpers/text";
import { useAppDispatch, useAppSelector } from "../hooks";
import type { Pokemon } from "../model/Pokemon";
import { loadPokemon, loadPokemonList, selectPokemon } from "../state/pokemonSlice";
import type { RootState } from "../store";
import { loadAllPokemonMoves } from "../state/pokemonMovesSlice";

const useStyles = makeStyles(() => ({
	container: {
		display: 'flex',
		flex: 1,
		width: '100%',
		height: '100%',
		minHeight: '97vh',
		paddingTop: 50, // header
		paddingBottom: 50, // footer
	},
	paper: {
		width: '100%',
		padding: 10
	},
	dropdown: {
		width: '100%',
		maxWidth: 400,
		justifySelf: 'center'
	}
}));

const Showcase = () => {
	const classes = useStyles();
	const dispatch = useAppDispatch();
	const pokemonList = useAppSelector((state: RootState) => selectPokemon(state));
	const [loaded, setLoaded] = useState<boolean>(false);
	const [error, setError] = useState<Error | undefined>(undefined);
	const [currentPokemonName, setCurrentPokemonName] = useState<string>("bulbasaur");
	const currentPokemon = pokemonList.find((p) => p.name === currentPokemonName) as Pokemon;

	// load list of pokemon and each pokemon info
	useEffect(() => {
		if (!loaded) {
			try {
				dispatch(loadPokemonList()).then(() => setLoaded(true));
			} catch (err: unknown) {
				setError(err as Error);
			}
		}
		// if (!loaded) {
		// 	try {
		// 		dispatch(loadPokemonList()).then((resp) => {
		// 			setLoaded(true);
		// 			const resList: Pokemon[] = resp.payload as Pokemon[];
		// 			dispatch(loadAllPokemon(resList.map(p => p.url)));
		// 		});
		// 	} catch (err: unknown) {
		// 		setError(err as Error);
		// 	}
		// }
	}, [dispatch, loaded]);

	// backup loader incase all or specific pokemon failed to load
	useEffect(() => {
		if (loaded && !!currentPokemon && !currentPokemon.id) {
			try {
				dispatch(loadPokemon(currentPokemon.url));
			} catch (err: unknown) {
				setError(err as Error);
			}
		}
	}, [currentPokemon, dispatch, loaded]);

	// load pokemon's moves (more detailed)
	useEffect(() => {
		if (loaded && !!currentPokemon.id) {
			try {
				const apis = currentPokemon.moves.map(m => m.move.url);
				dispatch(loadAllPokemonMoves(apis));
			} catch (err: unknown) {
				setError(err as Error);
			}
		}
	}, [currentPokemon, dispatch, loaded]);

	if (error) {
		return (
			<Container className={classes.container}>
				<Typography color="error">Error loading Pokémon: {error.message}</Typography>
			</Container>
		);
	}

	return (
		<Container className={classes.container}>
			<Paper elevation={12} className={classes.paper}>
				{loaded && pokemonList.length > 0 ?
					<>
						<Autocomplete
							options={pokemonList}
							getOptionLabel={(option) => toTitleCase(option.name)}
							// getOptionLabel={(option) => {
							// 	if (!!option.name && !!option.species?.name) {
							// 		const splitName = option.name.split('-');
							// 		if (splitName.length > 1 && splitName[0] === option.species.name) {
							// 			return `${toTitleCase(option.species.name)} (${splitName.map(n => toTitleCase(n)).slice(1).join('-')})`;
							// 		}
							// 	}
							// 	return toTitleCase(option.name);
							// }}
							renderInput={(params) => <TextField {...params} />}
							value={currentPokemon}
							disableClearable={true}
							onChange={(_event, value) => setCurrentPokemonName(value.name)}
							className={classes.dropdown}
						/>
						{currentPokemon && <PokemonDetails pokemon={currentPokemon} />}
					</>
					:
					<CircularProgress />
				}
			</Paper>
		</Container>
	);
};

export default Showcase;