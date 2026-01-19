import { Autocomplete, CircularProgress, Container, Paper, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import PokemonDetails from "../components/pokemon/PokemonDetails";
import ShowcaseBottomContext from "../context/ShowcaseBottomContext";
import getPokemonLabel from "../helpers/PokemonLabel";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { headerFooterPadding } from "../model/common";
import { loadPokemon, loadPokemonList, selectPokemon } from "../state/pokemonSlice";
import { loadAllPokemonMoves } from "../state/pokemonMovesSlice";


const Showcase = () => {
	const dispatch = useAppDispatch();
	const pokemonList = useAppSelector(selectPokemon);
	const [loaded, setLoaded] = useState<boolean>(false);
	const [error, setError] = useState<Error | undefined>(undefined);
	const initialPokemon = new URLSearchParams(window.location.search).get('pokemon');
	const [currentPokemonName, setCurrentPokemonName] = useState<string>(initialPokemon?.trim().toLowerCase() ?? "bulbasaur");
	const currentPokemon = pokemonList.find((p) => p.name === currentPokemonName);
	const ref = useRef<HTMLDivElement>(null);
	const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);
	const [bottom, setBottom] = useState<number>(0);
	const heightContextValue = useMemo(() => ({
		bottom
	}), [bottom]);

	// Set the tab name
	useEffect(() => {
		document.title = "Showcase - Pokemon";
	}, []);

	// read the initial pokemon from URL query param: ?pokemon=bulbasaur
	useEffect(() => {
		try {
			const params = new URLSearchParams(window.location.search);
			const raw = params.get('pokemon');
			const fromUrl = (raw ?? '').trim().toLowerCase();
			if (fromUrl) setCurrentPokemonName(fromUrl);
		} catch {
			// ignore malformed URL values
		}
		// run once on mount
	}, []);

	// keep the ?pokemon=... query param in sync with current selection
	useEffect(() => {
		try {
			const url = new URL(window.location.href);
			const pokemon = (currentPokemonName ?? '').trim().toLowerCase();
			if (pokemon) url.searchParams.set('pokemon', pokemon);
			else url.searchParams.delete('pokemon');
			const next = url.pathname + url.search + url.hash;
			const current = window.location.pathname + window.location.search + window.location.hash;
			if (next !== current) window.history.replaceState({}, '', next);
		} catch {
			// ignore
		}
	}, [currentPokemonName]);

	// rerender on any window resizing
	const handleResize = () => {
		setWindowHeight(window.innerHeight);
	};
	useEffect(() => {
		window.addEventListener('resize', handleResize);
		// Cleanup
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		const refBottom = ref.current?.getBoundingClientRect().bottom;
		if (refBottom && currentPokemon?.id) setBottom(Math.min(refBottom, windowHeight - Number(headerFooterPadding.replace('px', ''))));
	}, [currentPokemon, ref, windowHeight]);

	// load list of pokemon and each pokemon info
	useEffect(() => {
		if (!loaded) {
			try {
				dispatch(loadPokemonList()).then(() => setLoaded(true));
			} catch (err: unknown) {
				setError(err as Error);
			}
		}
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
		if (loaded && !!currentPokemon?.id) {
			try {
				const apis = currentPokemon.moves.map(m => m.move.url);
				dispatch(loadAllPokemonMoves(apis));
			} catch (err: unknown) {
				setError(err as Error);
			}
		}
	}, [currentPokemon, dispatch, loaded]);

	// error display
	if (error) {
		return (
			<Container sx={{ display: 'flex', flex: 1, width: '100%', minHeight: '100vh', paddingTop: headerFooterPadding, paddingBottom: headerFooterPadding, height: '100%' }}>
				<Typography color="error">Error loading Pokémon: {error.message}</Typography>
			</Container>
		);
	}

	return (
		<Container sx={{ display: 'flex', flex: 1, width: '100%', minHeight: '100vh', paddingTop: headerFooterPadding, paddingBottom: headerFooterPadding, height: '100%' }}>
			<Paper elevation={4} sx={{ width: '100%', p: 1.25 }} ref={ref}>
				<ShowcaseBottomContext.Provider value={heightContextValue}>
					{loaded && pokemonList.length > 0 ?
						<>
							<Autocomplete
								options={pokemonList}
								getOptionLabel={(option) => getPokemonLabel(option.name) ?? option.name}
								renderInput={(params) => <TextField {...params} />}
								value={currentPokemon ?? undefined}
								disableClearable={true}
								onChange={(_event, value) => {
									if (value?.name) setCurrentPokemonName(value.name);
								}}
								sx={{ width: '100%', maxWidth: 400, justifySelf: 'center', mb: 0.5 }}
							/>
							{currentPokemon && <PokemonDetails pokemon={currentPokemon} />}
						</>
						:
						<CircularProgress />
					}
				</ShowcaseBottomContext.Provider>
			</Paper>
		</Container>
	);
};

export default Showcase;