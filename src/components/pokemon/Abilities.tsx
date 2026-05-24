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
import { type WheelEvent as ReactWheelEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from 'react-router-dom';
import { toTitleCase } from "../../helpers/common";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import type { Pokemon, PokemonAbility } from "../../model/Pokemon";
import { type AbilityFetchState, loadAbilityDetails, selectAbilityFetchStateByUrl } from "../../state/abilitySlice";

interface AbilitiesProps {
    pokemon: Pokemon;
}

const Abilities = ({ pokemon }: AbilitiesProps) => {
    const abilities = pokemon.abilities;
    const dispatch = useAppDispatch();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedAbility, setSelectedAbility] = useState<PokemonAbility | null>(null);
    const dialogContentRef = useRef<HTMLDivElement | null>(null);
    const lastWheelNavAtRef = useRef<number>(0);

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
        if (!isDialogOpen) return;
        if (!selectedUrl) return;
        if (selectedFetchState.status === 'loading' || selectedFetchState.status === 'success') return;

        dispatch(loadAbilityDetails(selectedUrl));

    }, [dispatch, isDialogOpen, selectedFetchState.status, selectedUrl]);

    const openAbilityDialog = (ability: PokemonAbility) => {
        setSelectedAbility(ability);
        setIsDialogOpen(true);
    };

    const closeAbilityDialog = () => {
        setIsDialogOpen(false);
    };

    const toPrevAbility = () => {
        if (!canNavigateAbilities) return;
        const prevIndex = selectedAbilityIndex === 0
            ? displayedAbilities.length - 1
            : selectedAbilityIndex - 1;
        setSelectedAbility(displayedAbilities[prevIndex] ?? null);
    };

    const toNextAbility = () => {
        if (!canNavigateAbilities) return;
        const nextIndex = selectedAbilityIndex === displayedAbilities.length - 1
            ? 0
            : selectedAbilityIndex + 1;
        setSelectedAbility(displayedAbilities[nextIndex] ?? null);
    };

    const onDialogWheel = (e: ReactWheelEvent) => {
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
    };

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

    const onPokemonListWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
        // Keep the dialog's wheel handler from firing while still enabling
        // ability navigation when the list itself can't scroll further.
        e.stopPropagation();
        if (!canNavigateAbilities) return;

        const now = Date.now();
        if (now - lastWheelNavAtRef.current < 250) return;

        const el = e.currentTarget;
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
    };

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
                    sx={{ px: dialogNavGutterSx }}
                    onWheel={onDialogWheel}
                    ref={dialogContentRef}
                >
                    {selectedFetchState.status === 'loading' && (
                        <Stack direction="row" spacing={2} alignItems="center">
                            <CircularProgress size={18} />
                            <Typography>Loading ability info…</Typography>
                        </Stack>
                    )}

                    {selectedFetchState.status === 'error' && (
                        <Typography color="error">
                            {selectedFetchState.message}
                        </Typography>
                    )}

                    {selectedFetchState.status === 'success' && (
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
                                {selectedShortEffect && (
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">Short effect</Typography>
                                        <Typography>{selectedShortEffect}</Typography>
                                    </Box>
                                )}
                                {selectedEffect && (
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">Effect</Typography>
                                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selectedEffect}</Typography>
                                    </Box>
                                )}
                                {selectedFlavorText && (
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">Flavor text</Typography>
                                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selectedFlavorText}</Typography>
                                    </Box>
                                )}
                                {!selectedShortEffect && !selectedEffect && !selectedFlavorText && (
                                    <Typography color="textSecondary">
                                        No English description available for {selectedLabel}.
                                    </Typography>
                                )}
                            </Stack>

                            {/* Right column: pokemon list */}
                            <Box>
                                <Typography variant="caption" color="textSecondary">Pokémon with {selectedLabel}</Typography>

                                {pokemonWithAbility.length === 0 ? (
                                    <Typography color="textSecondary">
                                        No known Pokémon with {selectedLabel}.
                                    </Typography>
                                ) : (
                                    <Box
                                        sx={{
                                            maxHeight: { xs: 240, md: 420 },
                                            overflow: 'auto',
                                            pr: 1,
                                            border: (theme) => `1px solid ${theme.palette.divider}`,
                                            borderRadius: 1,
                                            p: 1,
                                        }}
                                        onWheel={onPokemonListWheel}
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
                                                            onClick={() => closeAbilityDialog()}
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
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Abilities;