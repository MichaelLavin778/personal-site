import { Autocomplete, CircularProgress, Container, Paper, TextField } from "@mui/material";
import { makeStyles } from "@material-ui/core";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { loadPokemonList, selectPokemonList, selectPokemonLoaded } from "../state/pokemonSlice";
import { useAppDispatch } from "../hooks";

const useStyles = makeStyles(() => ({
	container: {
		display: 'flex',
		flex: 1,
		width: '100%',
		height: '100%',
		minHeight: '97vh',
		paddingTop: 50, // header
		paddingBottom: 50, // footer
		alignItems: 'center',
		justifyContent: 'center'
	}
}));

const Showcase = () => {
	const classes = useStyles();
	const dispatch = useAppDispatch();
	const pokemonList = useSelector((state: RootState) => selectPokemonList(state));
	const isPokemonListLoaded = useSelector((state: RootState) => selectPokemonLoaded(state));

	useEffect(() => {
		dispatch(loadPokemonList());
	}, [dispatch]);

	const toTitleCase = (str: string) => {
		return str.replace(
			/\w\S*/g,
			text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
		);
	}

	return (
		<Container className={classes.container}>
			{isPokemonListLoaded && pokemonList.length > 0 ?
				<Paper elevation={3} sx={{ width: '100%' }}>
					<Autocomplete
						options={pokemonList}
						getOptionLabel={(option) => toTitleCase(option.name)}
						renderInput={(params) => <TextField {...params} />}
						defaultValue={pokemonList[0]}
						disableClearable={true}
					/>
				</Paper>
				:
				<CircularProgress color={isPokemonListLoaded && pokemonList.length <= 0 ? "error" : "primary"} />
			}
		</Container>
	);
};

export default Showcase;