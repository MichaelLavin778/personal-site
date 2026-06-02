import SearchIcon from "@mui/icons-material/Search";
import { Autocomplete, Box, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ShowcaseBottomContext from "../../context/ShowcaseBottomContext";
import { getPokemonNameFromSearch } from "../../helpers/common";
import getPokemonLabel from "../../helpers/PokemonLabel";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { useElementRect } from "../../hooks/useElementRect";
import { useViewportSize } from "../../hooks/useViewportSize";
import { headerFooterPaddingPx } from "../../model/common";
import { loadAllPokemonMoves } from "../../state/pokemonMovesSlice";
import { getDefaultPokemonVariant, getNextPokemon, getPokemon, getPokemonList, getPreviousPokemon, loadPokemon, loadPokemonVariant } from "../../state/pokemonSlice";
import PokemonDetails from "./PokemonDetails";
import PokemonNavigationButton from "./PokemonNavigationButton";
import ShowcaseContainer from "./ShowcaseContainer";

const ShowcaseBody = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const pokemonList = useAppSelector(getPokemonList);
	const [currentPokemonName, setCurrentPokemonName] = useState<string>(
		() => getPokemonNameFromSearch(location.search)
	);

	const currentPokemon = useAppSelector((state) => getPokemon(state, currentPokemonName));
	const currentPokemonVariant = useAppSelector((state) => getDefaultPokemonVariant(state, currentPokemonName));
	const previousPokemon = useAppSelector((state) => getPreviousPokemon(state, currentPokemonName));
	const nextPokemon = useAppSelector((state) => getNextPokemon(state, currentPokemonName));
	const currentPokemonId = currentPokemon?.id;
	const currentPokemonUrl = currentPokemon?.url;
	const currentPokemonVariantId = currentPokemonVariant?.id;
	const currentPokemonVariantMoves = currentPokemonVariant?.moves;
	const currentPokemonVariantUrl = currentPokemonVariant?.url;

	// const generations = useAppSelector(getGenerations);
	// const [selectedGenerationId, setSelectedGenerationId] = useState<number>(generations.at(-1)?.id ?? 9);
	// const selectedGenerationValue = generations.some((generation) => generation.id === selectedGenerationId)
	// 	? selectedGenerationId
	// 	: '';

	const [error, setError] = useState<Error | undefined>(undefined);
	const pendingPokemonNameRef = useRef<string | null>(null);

	// page controls
	const paperRef = useRef<HTMLDivElement>(null);
	const showcaseRect = useElementRect(paperRef);
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

	// backup loader incase all or specific pokemon failed to load
	useEffect(() => {
		if (currentPokemonUrl && !currentPokemonId) {
			dispatch(loadPokemon(currentPokemonUrl))
				.unwrap()
				.catch((message) => {
					if ((message as Error)?.name !== 'ConditionError')
						setError(new Error(String(message)));
				});
		}
	}, [currentPokemonId, currentPokemonUrl, dispatch]);

	// load the default variety's detailed sprites, stats, abilities, and moves
	useEffect(() => {
		if (currentPokemonVariantUrl && !currentPokemonVariantId) {
			dispatch(loadPokemonVariant(currentPokemonVariantUrl))
				.unwrap()
				.catch((message) => {
					if ((message as Error)?.name !== 'ConditionError')
						setError(new Error(String(message)));
				});
		}
	}, [currentPokemonVariantId, currentPokemonVariantUrl, dispatch]);

	// load pokemon's moves (more detailed)
	useEffect(() => {
		if (currentPokemonVariantId) {
			const apis = (currentPokemonVariantMoves ?? []).map(m => m.move.url);
			dispatch(loadAllPokemonMoves(apis));
		}
	}, [currentPokemonVariantId, currentPokemonVariantMoves, dispatch]);

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
			<Paper elevation={4} sx={{ width: '100%', p: 1.25 }} ref={paperRef}>
				<ShowcaseBottomContext.Provider value={heightContextValue}>
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
							<Box sx={{ gridArea: 'previous' }}>
								<PokemonNavigationButton
									direction="previous"
									pokemon={previousPokemon}
									onClick={() => previousPokemon && selectPokemonName(previousPokemon.name)}
								/>
							</Box>
							<Box sx={{ gridArea: 'selector', display: 'flex', gap: 1, minWidth: 0 }}>
								<Autocomplete
									options={pokemonList}
									clearOnBlur={true}
									getOptionLabel={(option) => {
										const name = typeof option === 'string' ? option : option.name;
										return getPokemonLabel(name) ?? name;
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Pokemon"
											slotProps={{
												input: {
													...params.InputProps,
													startAdornment: (
														<InputAdornment position="start">
															<SearchIcon />
														</InputAdornment>
													),
												},
											}}
										/>
									)}
									value={currentPokemon ?? undefined}
									disableClearable={true}
									onChange={(_event, value) => {
										const name = typeof value === 'string' ? value : value?.name;
										if (!name) return;
										selectPokemonName(name);
									}}
									sx={{ flex: 1, minWidth: 0 }}
								/>
								{/* <FormControl sx={{ flexShrink: 0, minWidth: 72 }}>
						<InputLabel htmlFor="pokemon-generation-input" id="pokemon-generation-label">Gen</InputLabel>
									<Select
										id="pokemon-generation-select"
										inputProps={{ id: 'pokemon-generation-input' }}
										labelId="pokemon-generation-label"
										label="Gen"
										name="pokemon-generation"
										value={selectedGenerationValue}
										onChange={(event) => setSelectedGenerationId(Number(event.target.value))}
									>
										{generations.map((generation) => (
											<MenuItem key={generation.id} value={generation.id}>
												{generation.id}
											</MenuItem>
										))}
									</Select>
								</FormControl> */}
							</Box>
							<Box sx={{ gridArea: 'next' }}>
								<PokemonNavigationButton
									direction="next"
									pokemon={nextPokemon}
									onClick={() => nextPokemon && selectPokemonName(nextPokemon.name)}
								/>
							</Box>
						</Box>
						{currentPokemonVariantId && currentPokemonVariant && (
							<PokemonDetails
								pokemon={currentPokemonVariant}
							/>
						)}
					</Box>
				</ShowcaseBottomContext.Provider>
			</Paper>
		</ShowcaseContainer>
	);
};

export default ShowcaseBody;
