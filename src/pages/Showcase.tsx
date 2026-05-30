import { Autocomplete, Box, CircularProgress, Container, Paper, TextField, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PokemonDetails from "../components/pokemon/PokemonDetails";
import PokemonNavigationButton from "../components/pokemon/PokemonNavigationButton";
import ShowcaseBottomContext from "../context/ShowcaseBottomContext";
import { getPokemonNameFromSearch } from "../helpers/common";
import getPokemonLabel from "../helpers/PokemonLabel";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { useElementRect } from "../hooks/useElementRect";
import { useViewportSize } from "../hooks/useViewportSize";
import { headerFooterPadding, headerFooterPaddingPx } from "../model/common";
import { loadAllPokemonMoves } from "../state/pokemonMovesSlice";
import { getNextPokemon, getPokemon, getPokemonList, getPreviousPokemon, loadGenderlessPokemonList, loadPokemon, loadPokemonList } from "../state/pokemonSlice";

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

	const [currentPokemonName, setCurrentPokemonName] = useState<string>(
		() => getPokemonNameFromSearch(location.search)
	);
	const [error, setError] = useState<Error | undefined>(undefined);
	const pendingPokemonNameRef = useRef<string | null>(null);

	const pokemonList = useAppSelector(getPokemonList);
	const loaded = pokemonList.length > 0;
	const needsGenderData = pokemonList.some((pokemon) => pokemon.gender === undefined);
	const currentPokemon = useAppSelector((state) => getPokemon(state, currentPokemonName));
	const previousPokemon = useAppSelector((state) => getPreviousPokemon(state, currentPokemonName));
	const nextPokemon = useAppSelector((state) => getNextPokemon(state, currentPokemonName));
	const currentPokemonId = currentPokemon?.id;
	const currentPokemonMoves = currentPokemon?.moves;
	const currentPokemonUrl = currentPokemon?.url;

	const ref = useRef<HTMLDivElement>(null);
	const showcaseRect = useElementRect(ref);
	const viewportSize = useViewportSize();
	const bottom = useMemo(
		() => {
			if (!showcaseRect.bottom) return 0;
			return Math.ceil(Math.min(showcaseRect.bottom, viewportSize.height - headerFooterPaddingPx));
		},
		[showcaseRect.bottom, viewportSize.height]
	);
	const heightContextValue = useMemo(() => ({
		bottom
	}), [bottom]);

	const selectPokemonName = useCallback((pokemonName: string) => {
		const nextPokemonName = pokemonName.trim().toLowerCase();
		if (!nextPokemonName) return;

		setCurrentPokemonName(nextPokemonName);
		try {
			const params = new URLSearchParams(location.search);
			params.set('pokemon', nextPokemonName);
			params.delete('ability');
			params.delete('move');
			pendingPokemonNameRef.current = nextPokemonName;
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
	}, [location.hash, location.pathname, location.search, navigate]);

	// Set the tab name
	useEffect(() => {
		document.title = "Showcase - Pokemon";
	}, []);

	// React to changes in the URL query param (e.g., clicking a link while already on /showcase)
	useEffect(() => {
		try {
			const fromUrl = getPokemonNameFromSearch(location.search);
			const pendingPokemonName = pendingPokemonNameRef.current;

			if (pendingPokemonName && fromUrl !== pendingPokemonName) return;
			if (pendingPokemonName && fromUrl === pendingPokemonName) pendingPokemonNameRef.current = null;

			if (fromUrl && fromUrl !== currentPokemonName) setCurrentPokemonName(fromUrl);
		} catch {
			// ignore malformed URL values
		}
	}, [currentPokemonName, location.search]);

	// load list of pokemon and each pokemon info
	useEffect(() => {
		if (loaded) return;

		dispatch(loadPokemonList())
			.unwrap()
			.catch((message) => {
				if ((message as Error)?.name !== 'ConditionError')
					setError(new Error(String(message)));
			});
	}, [dispatch, loaded]);

	// backup loader incase all or specific pokemon failed to load
	useEffect(() => {
		if (loaded && currentPokemonUrl && !currentPokemonId) {
			dispatch(loadPokemon(currentPokemonUrl))
				.unwrap()
				.catch((message) => {
					if ((message as Error)?.name !== 'ConditionError')
						setError(new Error(String(message)));
				});
		}
	}, [currentPokemonId, currentPokemonUrl, dispatch, loaded]);

	// load gender data and merge it into the already-loaded pokemon list
	useEffect(() => {
		if (!loaded || !needsGenderData) return;
		dispatch(loadGenderlessPokemonList())
			.unwrap()
			.catch((message) => {
				if ((message as Error)?.name !== 'ConditionError')
					setError(new Error(String(message)));
			});
	}, [dispatch, loaded, needsGenderData]);

	// load pokemon's moves (more detailed)
	useEffect(() => {
		if (loaded && !!currentPokemonId) {
			const apis = (currentPokemonMoves ?? []).map(m => m.move.url);
			dispatch(loadAllPokemonMoves(apis));
		}
	}, [currentPokemonId, currentPokemonMoves, dispatch, loaded]);

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
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: {
										xs: 'minmax(0, 1fr) minmax(0, 1fr)',
										sm: 'minmax(126px, 1fr) minmax(220px, 400px) minmax(126px, 1fr)',
									},
									gridTemplateAreas: {
										xs: '"selector selector" "previous next"',
										sm: '"previous selector next"',
									},
									gap: 1,
									alignItems: 'center',
									width: '100%',
									maxWidth: 850,
									mx: 'auto',
								}}
							>
								<Box sx={{ gridArea: 'previous', minWidth: 0 }}>
									<PokemonNavigationButton
										direction="previous"
										pokemon={previousPokemon}
										onClick={() => previousPokemon && selectPokemonName(previousPokemon.name)}
									/>
								</Box>
								<Box sx={{ gridArea: 'selector', minWidth: 0 }}>
									<Autocomplete
										options={pokemonList}
										getOptionLabel={(option) => getPokemonLabel(option.name) ?? option.name}
										renderInput={(params) => <TextField {...params} />}
										value={currentPokemon ?? undefined}
										disableClearable={true}
										onChange={(_event, value) => {
											if (!value?.name) return;
											selectPokemonName(value.name);
										}}
										sx={{ width: '100%' }}
									/>
								</Box>
								<Box sx={{ gridArea: 'next', minWidth: 0 }}>
									<PokemonNavigationButton
										direction="next"
										pokemon={nextPokemon}
										onClick={() => nextPokemon && selectPokemonName(nextPokemon.name)}
									/>
								</Box>
							</Box>
							{currentPokemon && (
								<PokemonDetails
									pokemon={currentPokemon}
								/>
							)}
						</Box>
						:
						<CircularProgress />
					}
				</ShowcaseBottomContext.Provider>
			</Paper>
		</ShowcaseContainer>
	);
};

export default Showcase;
