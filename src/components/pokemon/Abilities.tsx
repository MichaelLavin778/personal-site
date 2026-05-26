import CloseIcon from "@mui/icons-material/Close";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
    Box,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Link,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { type MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { toTitleCase } from "../../helpers/common";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import type { Pokemon, PokemonAbility } from "../../model/Pokemon";
import { type AbilityFetchState, loadAbilityDetails, selectAbilityFetchStateByUrl } from "../../state/abilitySlice";

interface AbilitiesProps {
    pokemon: Pokemon;
}

const Abilities = ({ pokemon }: AbilitiesProps) => {
    const abilities = pokemon.abilities;
    const displayedAbilities = useMemo(() => {
        if (!abilities || abilities.length === 0) return [];

        const abilityLabels = abilities.map((ability) => {
            if (ability.ability.name === 'soul-heart')
                return { ...ability, ability: { ...ability.ability, name: 'Soul-Heart' } };
            if (ability.ability.name === 'well-baked-body')
                return { ...ability, ability: { ...ability.ability, name: 'Well-Baked Body' } };
            return { ...ability, ability: { ...ability.ability, name: toTitleCase(ability.ability.name.replaceAll('-', ' ')) } };
        });

        const nonHidden = abilityLabels.filter(a => !a.is_hidden);
        const hidden = abilityLabels.find(a => a.is_hidden);
        return hidden ? [...nonHidden, hidden] : nonHidden;
    }, [abilities]);

    const getAbilityParamValue = useCallback((ability: PokemonAbility) => {
        const fromUrl = ability.ability.url.split('/').filter(Boolean).at(-1);
        return fromUrl ?? ability.ability.name.trim().toLowerCase().replaceAll(' ', '-');
    }, []);

    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const initialAbilityParamRef = useRef(new URLSearchParams(location.search).get('ability'));
    const hasAppliedInitialAbilityParamRef = useRef(false);
    const initialAbility = displayedAbilities.find(
        (ability) => getAbilityParamValue(ability) === initialAbilityParamRef.current
    ) || null;
    const [isDialogOpen, setIsDialogOpen] = useState(Boolean(initialAbility));
    const [selectedAbility, setSelectedAbility] = useState<PokemonAbility | null>(initialAbility);
    const dialogContentRef = useRef<HTMLDivElement | null>(null);
    const pokemonListRef = useRef<HTMLDivElement | null>(null);
    const lastWheelNavAtRef = useRef<number>(0);

    const setAbilityUrlParam = useCallback((ability: PokemonAbility | null) => {
        const params = new URLSearchParams(window.location.search || location.search);

        if (ability) {
            params.set('ability', getAbilityParamValue(ability));
            params.delete('move');
        } else
            params.delete('ability');

        const nextSearch = params.toString();
        navigate(
            {
                pathname: location.pathname,
                search: nextSearch ? `?${nextSearch}` : '',
                hash: window.location.hash || location.hash,
            },
            { replace: true }
        );
    }, [getAbilityParamValue, location.hash, location.pathname, location.search, navigate]);

    const selectedUrl = selectedAbility?.ability.url ?? '';
    const selectedLabel = selectedAbility?.ability.name ?? '';

    const selectedFetchState: AbilityFetchState = useAppSelector((state) =>
        selectAbilityFetchStateByUrl(state, selectedUrl)
    );

    const selectedAbilityIndex = useMemo(() => {
        if (!selectedAbility) return -1;
        return displayedAbilities.findIndex(a =>
            a.slot === selectedAbility.slot &&
            a.is_hidden === selectedAbility.is_hidden &&
            a.ability.url === selectedAbility.ability.url
        );
    }, [displayedAbilities, selectedAbility]);

    const canNavigateAbilities = displayedAbilities.length > 1 && selectedAbilityIndex >= 0;

    // Reserve space so side nav arrows don't overlap dialog text
    const dialogNavGutterSx = { xs: 6, sm: 7 };

    useEffect(() => {
        if (hasAppliedInitialAbilityParamRef.current) return;

        const initialAbilityParam = initialAbilityParamRef.current;
        if (!initialAbilityParam) {
            hasAppliedInitialAbilityParamRef.current = true;
            return;
        }

        const abilityFromUrl = displayedAbilities.find(
            (ability) => getAbilityParamValue(ability) === initialAbilityParam
        );
        if (!abilityFromUrl) return;

        setSelectedAbility(abilityFromUrl);
        setIsDialogOpen(true);
        hasAppliedInitialAbilityParamRef.current = true;
    }, [displayedAbilities, getAbilityParamValue]);

    useEffect(() => {
        if (!isDialogOpen) return;
        if (!selectedUrl) return;
        if (selectedFetchState.status === 'loading' || selectedFetchState.status === 'success') return;

        dispatch(loadAbilityDetails(selectedUrl));

    }, [dispatch, isDialogOpen, selectedFetchState.status, selectedUrl]);

    const openAbilityDialog = (ability: PokemonAbility) => {
        setSelectedAbility(ability);
        setIsDialogOpen(true);
        setAbilityUrlParam(ability);
    };

    const closeAbilityDialog = () => {
        setIsDialogOpen(false);
        setAbilityUrlParam(null);
    };

    const navigateToPokemon = useCallback((event: ReactMouseEvent, pokemonName: string) => {
        event.preventDefault();
        const params = new URLSearchParams(location.search);
        params.set('pokemon', pokemonName);
        params.delete('ability');
        params.delete('move');

        setIsDialogOpen(false);
        navigate(
            {
                pathname: location.pathname,
                search: `?${params.toString()}`,
                hash: location.hash,
            }
        );
    }, [location.hash, location.pathname, location.search, navigate]);

    const toPrevAbility = useCallback(() => {
        if (!canNavigateAbilities) return;
        const prevIndex = selectedAbilityIndex === 0
            ? displayedAbilities.length - 1
            : selectedAbilityIndex - 1;
        const nextAbility = displayedAbilities[prevIndex] ?? null;
        setSelectedAbility(nextAbility);
        setAbilityUrlParam(nextAbility);
    }, [canNavigateAbilities, displayedAbilities, selectedAbilityIndex, setAbilityUrlParam]);

    const toNextAbility = useCallback(() => {
        if (!canNavigateAbilities) return;
        const nextIndex = selectedAbilityIndex === displayedAbilities.length - 1
            ? 0
            : selectedAbilityIndex + 1;
        const nextAbility = displayedAbilities[nextIndex] ?? null;
        setSelectedAbility(nextAbility);
        setAbilityUrlParam(nextAbility);
    }, [canNavigateAbilities, displayedAbilities, selectedAbilityIndex, setAbilityUrlParam]);

    const onDialogWheel = useCallback((e: WheelEvent) => {
        if (!canNavigateAbilities) return;

        const el = dialogContentRef.current;
        if (!el) return;

        // Small throttle so a single "scroll" gesture doesn't skip multiple abilities.
        const now = Date.now();
        if (now - lastWheelNavAtRef.current < 250) return;

        const { scrollTop, scrollHeight, clientHeight } = el;
        const isScrollable = scrollHeight > clientHeight + 1;
        const atTop = scrollTop <= 0;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

        // Scroll up => previous (left). Scroll down => next (right).
        if (e.deltaY < 0 && (!isScrollable || atTop)) {
            e.preventDefault();
            lastWheelNavAtRef.current = now;
            toPrevAbility();
            return;
        }

        if (e.deltaY > 0 && (!isScrollable || atBottom)) {
            e.preventDefault();
            lastWheelNavAtRef.current = now;
            toNextAbility();
        }
    }, [canNavigateAbilities, toNextAbility, toPrevAbility]);

    const { selectedShortEffect, selectedEffect, selectedFlavorText } = useMemo(() => {
        if (selectedFetchState.status !== 'success')
            return { selectedShortEffect: '', selectedEffect: '', selectedFlavorText: '' };

        const ability = selectedFetchState.ability;
        const enEffect = (ability.effect_entries ?? []).find(e => e.language?.name === 'en');
        const enFlavor = (ability.flavor_text_entries ?? []).find(e => e.language?.name === 'en');

        const normalize = (s: string) => s.replaceAll('\f', '\n').trim();

        return {
            selectedShortEffect: enEffect?.short_effect ? normalize(enEffect.short_effect) : '',
            selectedEffect: enEffect?.effect ? normalize(enEffect.effect) : '',
            selectedFlavorText: enFlavor?.flavor_text ? normalize(enFlavor.flavor_text) : '',
        };
    }, [selectedFetchState]);

    const pokemonWithAbility = useMemo(() => {
        if (selectedFetchState.status !== 'success') return [];
        return (selectedFetchState.ability.pokemon ?? [])
            .map((p) => p?.pokemon?.name)
            .filter((name): name is string => !!name)
            .map((name) => ({
                name,
                label: toTitleCase(name.replaceAll('-', ' ')),
            }));
    }, [selectedFetchState]);

    const onPokemonListWheel = useCallback((e: WheelEvent) => {
        // Keep the dialog's wheel handler from firing while still enabling
        // ability navigation when the list itself can't scroll further.
        e.stopPropagation();
        if (!canNavigateAbilities) return;

        const now = Date.now();
        if (now - lastWheelNavAtRef.current < 250) return;

        const el = pokemonListRef.current;
        if (!el) return;

        const { scrollTop, scrollHeight, clientHeight } = el;
        const isScrollable = scrollHeight > clientHeight + 1;
        const atTop = scrollTop <= 0;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

        if (e.deltaY < 0 && (!isScrollable || atTop)) {
            e.preventDefault();
            lastWheelNavAtRef.current = now;
            toPrevAbility();
            return;
        }

        if (e.deltaY > 0 && (!isScrollable || atBottom)) {
            e.preventDefault();
            lastWheelNavAtRef.current = now;
            toNextAbility();
        }
    }, [canNavigateAbilities, toNextAbility, toPrevAbility]);

    useEffect(() => {
        const el = dialogContentRef.current;
        if (!el || !isDialogOpen) return;

        el.addEventListener('wheel', onDialogWheel, { passive: false });
        return () => el.removeEventListener('wheel', onDialogWheel);
    }, [isDialogOpen, onDialogWheel]);

    useEffect(() => {
        const el = pokemonListRef.current;
        if (!el || !isDialogOpen) return;

        el.addEventListener('wheel', onPokemonListWheel, { passive: false });
        return () => el.removeEventListener('wheel', onPokemonListWheel);
    }, [isDialogOpen, onPokemonListWheel]);

    const renderAbilities = () => {
        const hiddenAbility = displayedAbilities.find(a => a.is_hidden);
        const nonHiddenAbilities = displayedAbilities.filter(a => !a.is_hidden);

        return (
            <>
                {nonHiddenAbilities.map(ability => (
						<Link
                            key={`${ability.ability.name}-${ability.slot}`}
                            onClick={() => openAbilityDialog(ability)}
                            component="span"
                            variant="body1"
                            sx={{
                                display: 'block',
                                width: 'fit-content',
                                color: 'textPrimary',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' },
                            }}
                            aria-label={`Open ability info for ${ability.ability.name}`}
                        >
                            <Typography component="span" color="textPrimary">
                                {ability.ability.name}
                            </Typography>
                        </Link>
					))}
                {!!hiddenAbility && (
                    <Link
                        key={`${hiddenAbility.ability.name}-${hiddenAbility.slot}`}
                        onClick={() => openAbilityDialog(hiddenAbility)}
                        component="span"
                        variant="body2"
                        sx={{
                            display: 'block',
                            width: 'fit-content',
                            color: 'textPrimary',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                        aria-label={`Open ability info for ${hiddenAbility.ability.name} (hidden)`}
                    >
                        <Typography component="span" variant="body2" color="textPrimary">
                            {hiddenAbility.ability.name} (hidden)
                        </Typography>
                    </Link>
                )}
            </>
        );
    };

    return (
        <>
            <Box>
                <Typography component="label" variant="caption" color="textSecondary">Abilities</Typography>
            </Box>
            {displayedAbilities.length > 0 ? renderAbilities() : '-'}

            {/* Ability info dialog */}
            <Dialog
                open={isDialogOpen}
                onClose={closeAbilityDialog}
                aria-labelledby="ability-info-title"
                fullWidth
                maxWidth="lg"
                slotProps={{
                    paper: {
                        sx: {
                            position: 'relative',
                            // Give the new 2-col layout room even on larger screens.
                            width: { xs: '100%', md: 'min(980px, 100%)' },
                            minHeight: '542px',
                            display: 'flex',
                            flexDirection: 'column',
                        },
                    },
                }}
            >
                <DialogTitle id="ability-info-title" sx={{ pl: dialogNavGutterSx, pr: dialogNavGutterSx }}>
                    <Typography component="span">
                        {selectedLabel || 'Ability'}
                    </Typography>
                    {!!selectedAbility?.is_hidden && (
                        <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                            (hidden)
                        </Typography>
                    )}
                    <IconButton
                        aria-label="close ability info"
                        onClick={closeAbilityDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                {/* Ability navigation buttons */}
                <IconButton
                    aria-label="previous ability"
                    onClick={toPrevAbility}
                    disabled={!canNavigateAbilities}
                    sx={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                        opacity: 0.45,
                        bgcolor: 'transparent',
                        border: 'none',
                        transition: 'opacity 120ms ease',
                        '&:hover': { opacity: 0.85, bgcolor: 'transparent' },
                        '&.Mui-focusVisible': { opacity: 0.85 },
                        '&.Mui-disabled': { opacity: 0.2 },
                    }}
                >
                    <NavigateBeforeIcon />
                </IconButton>
                <IconButton
                    aria-label="next ability"
                    onClick={toNextAbility}
                    disabled={!canNavigateAbilities}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                        opacity: 0.45,
                        bgcolor: 'transparent',
                        border: 'none',
                        transition: 'opacity 120ms ease',
                        '&:hover': { opacity: 0.85, bgcolor: 'transparent' },
                        '&.Mui-focusVisible': { opacity: 0.85 },
                        '&.Mui-disabled': { opacity: 0.2 },
                    }}
                >
                    <NavigateNextIcon />
                </IconButton>

                {/* Ability info content */}
                <DialogContent
                    dividers
                    sx={{ px: dialogNavGutterSx, flex: 1 }}
                    ref={dialogContentRef}
                >
                    {selectedFetchState.status === 'loading' && (
                        <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
                            <CircularProgress size={18} />
                        </Stack>
                    )}

                    {selectedFetchState.status === 'error' && (
                        <Typography color="error" sx={{ mb: 2 }}>
                            {selectedFetchState.message}
                        </Typography>
                    )}

                    <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                gap: 2,
                                alignItems: 'start',
                            }}
                        >
                            {/* Left column: ability text */}
                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">Short effect</Typography>
                                    <Typography>{selectedShortEffect || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">Effect</Typography>
                                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selectedEffect || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">Flavor text</Typography>
                                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selectedFlavorText || '-'}</Typography>
                                </Box>
                            </Stack>

                            {/* Right column: pokemon list */}
                            <Box>
                                <Typography variant="caption" color="textSecondary">Pokémon with {selectedLabel}</Typography>

                                {selectedFetchState.status === 'success' && pokemonWithAbility.length === 0 && (
                                    <Typography color="textSecondary">
                                        No known Pokémon with {selectedLabel}.
                                    </Typography>
                                )}
                                {selectedFetchState.status === 'success' && pokemonWithAbility.length > 0 && (
                                    <Box
                                        sx={{
                                            maxHeight: { xs: 240, md: 420 },
                                            overflow: 'auto',
                                            pr: 1,
                                            border: (theme) => `1px solid ${theme.palette.divider}`,
                                            borderRadius: 1,
                                            p: 1,
                                        }}
                                        ref={pokemonListRef}
                                    >
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                                                columnGap: 2,
                                                rowGap: 0.5,
                                            }}
                                        >
                                            {pokemonWithAbility.map((poke) => (
                                                <Tooltip title={poke.label} key={poke.name} placement="right" followCursor={true}>
                                                    {pokemon.name !== poke.name ? (
                                                        <Link
                                                            key={poke.name}
                                                            component={RouterLink}
                                                            to={`/showcase?pokemon=${encodeURIComponent(poke.name)}`}
                                                            onClick={(event) => navigateToPokemon(event, poke.name)}
                                                            variant="body2"
                                                            sx={{
                                                                color: 'textPrimary',
                                                                textDecoration: 'none',
                                                                textWrap: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                '&:hover': { textDecoration: 'underline' },
                                                            }}
                                                            aria-label={`Go to ${poke.label} showcase page`}
                                                        >
                                                            {poke.label}
                                                        </Link>
                                                    ) : (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: 'textPrimary',
                                                                textDecoration: 'none',
                                                                textWrap: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                        >
                                                            {poke.label}
                                                        </Typography>
                                                    )}
                                                </Tooltip>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Abilities;
