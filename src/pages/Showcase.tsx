import { Autocomplete, CircularProgress, Container, Paper, TextField, Typography } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PokemonDetails from "../components/pokemon/PokemonDetails";
import ShowcaseBottomContext from "../context/ShowcaseBottomContext";
import getPokemonLabel from "../helpers/PokemonLabel";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { headerFooterPadding } from "../model/common";
import { loadAllPokemonMoves } from "../state/pokemonMovesSlice";
import { loadGenderlessPokemonList, loadPokemon, loadPokemonList, selectPokemon } from "../state/pokemonSlice";


type ShowcaseContainerProps = {
	children: React.ReactNode;
}
const ShowcaseContainer = ({ children }: ShowcaseContainerProps) => (
	<Container
		sx={{ display: 'flex', flex: 1, width: '100%', minHeight: '100vh', paddingTop: headerFooterPadding, paddingBottom: headerFooterPadding, height: '100%' }}
	>
		{children}
	</Container>
);

const Showcase = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const pokemonList = useAppSelector(selectPokemon);
	const [loaded, setLoaded] = useState<boolean>(false);
	const [error, setError] = useState<Error | undefined>(undefined);
	const [currentPokemonName, setCurrentPokemonName] = useState<string>(() => {
		const initialPokemon = new URLSearchParams(location.search).get('pokemon');
		return initialPokemon?.trim().toLowerCase() ?? "bulbasaur";
	});
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

	// React to changes in the URL query param (e.g., clicking a link while already on /showcase)
	useEffect(() => {
		try {
			const params = new URLSearchParams(location.search);
			const raw = params.get('pokemon');
			const fromUrl = (raw ?? '').trim().toLowerCase();
			if (fromUrl && fromUrl !== currentPokemonName) setCurrentPokemonName(fromUrl);
		} catch {
			// ignore malformed URL values
		}
	}, [currentPokemonName, location.search]);

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

	// load gender data and merge it into the already-loaded pokemon list
	useEffect(() => {
		if (!loaded) return;
		dispatch(loadGenderlessPokemonList())
			.unwrap()
			.catch((message) => setError(new Error(String(message))));
	}, [dispatch, loaded]);

	// load pokemon's moves (more detailed)
	useEffect(() => {
		if (loaded && !!currentPokemon?.id) {
			try {
				const apis = (currentPokemon.moves ?? []).map(m => m.move.url);
				dispatch(loadAllPokemonMoves(apis));
			} catch (err: unknown) {
				setError(err as Error);
			}
		}
	}, [currentPokemon, dispatch, loaded]);

	// error display
	if (error) {
		return (
			<ShowcaseContainer>
				<Typography color="error">Error loading Pokémon: {error.message}</Typography>
			</ShowcaseContainer>
		);
	}

	return (
		<ShowcaseContainer>
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
									if (!value?.name) return;
									const nextPokemon = value.name.trim().toLowerCase();
									setCurrentPokemonName(nextPokemon);
									try {
										const params = new URLSearchParams(location.search);
										params.set('pokemon', nextPokemon);
										navigate(
											{
												pathname: location.pathname,
												search: `?${params.toString()}`,
												hash: location.hash,
											},
											{ replace: true }
										);
									} catch {
										// ignore
									}
								}}
								sx={{ width: '100%', maxWidth: 400, justifySelf: 'center', mb: 0.5 }}
							/>
							{currentPokemon && (
								<PokemonDetails
									pokemon={currentPokemon}
								/>
							)}
						</>
						:
						<CircularProgress />
					}
				</ShowcaseBottomContext.Provider>
			</Paper>
		</ShowcaseContainer>
	);
};

export default Showcase;