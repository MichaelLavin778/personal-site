import { Autocomplete, CircularProgress, Container, Paper, TextField, Typography } from "@mui/material";
import { makeStyles } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { loadPokemon, loadPokemonList, selectPokemonList  } from "../state/pokemonSlice";
import type { RootState } from "../store";
import PokemonDetails from "../components/pokemon/PokemonDetails";
import type { Pokemon } from "../model/Pokemon";

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
	const pokemonList = useAppSelector((state: RootState) => selectPokemonList(state));
	const [loaded, setLoaded] = useState<boolean>(false);
	const [error, setError] = useState<Error | undefined>(undefined);
	const [currentPokemonName, setCurrentPokemonName] = useState<string>("bulbasaur");
	const currentPokemon = pokemonList.find((p) => p.name === currentPokemonName) as Pokemon;

	useEffect(() => {
		// if (!loaded) {
		// 	try {
		// 		dispatch(loadPokemonList()).then((resp) => {
		// 			const resList: Pokemon[] = resp.payload as Pokemon[];
		// 			dispatch(loadPokemon(resList.map(p => p.name))).then(() => setLoaded(true));
		// 		});
		// 	} catch (err: unknown) {
		// 		setError(err as Error);
		// 	}
		// }
		if (!loaded) {
			try {
				dispatch(loadPokemonList()).then(() => setLoaded(true));
			} catch (err: unknown) {
				setError(err as Error);
			}
		}
	}, [dispatch, loaded, pokemonList]);

	useEffect(() => {
		if (!!currentPokemon && currentPokemon.id === undefined) {
			try {
				dispatch(loadPokemon(currentPokemon.url));
			} catch (err: unknown) {
				setError(err as Error);
			}
		}
	}, [currentPokemon, dispatch, pokemonList]);

	const toTitleCase = (str: string) => {
		return str.replace(
			/\w\S*/g,
			text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
		);
	};

	if (error) {
		return (
			<Container className={classes.container}>
				<Typography color="error">Error loading Pokémon: {error.message}</Typography>
			</Container>
		);
	}

	return (
		<Container className={classes.container}>
			{loaded && pokemonList.length > 0 ?
				<Paper elevation={12} className={classes.paper}>
					<Autocomplete
						options={pokemonList}
						getOptionLabel={(option) => toTitleCase(option.name)}
						renderInput={(params) => <TextField {...params} />}
						value={currentPokemon}
						disableClearable={true}
						onChange={(_event, value) => setCurrentPokemonName(value.name)}
						className={classes.dropdown}
					/>
					{currentPokemon && <PokemonDetails pokemon={currentPokemon} />}
				</Paper>
				:
				<CircularProgress />
			}
		</Container>
	);
};

export default Showcase;