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
    Typography
} from "@mui/material";
import {
    type Dispatch,
    type WheelEvent as ReactWheelEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { Link as RouterLink } from "react-router-dom";
import { toTitleCase } from "../../helpers/common";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { loadMove, selectAllMoves } from "../../state/pokemonMovesSlice";
import Type from "./Type";


export type MoveRow = {
    id: number;
    learned: string;
    name: string;
    rawName: string;
    url: string;
    type: string;
    category: string;
    power: string;
    accuracy: string;
};

type MoveModalProps = {
    rows: MoveRow[];
    selectedMoveRow: MoveRow | null;
    setMove: Dispatch<MoveRow | null>;
}

const MoveModal = ({
    rows,
    selectedMoveRow,
    setMove
}: MoveModalProps) => {
    const dispatch = useAppDispatch();

    const allMovesByName = useAppSelector(selectAllMoves);

    const [selectedMoveStatus, setSelectedMoveStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [selectedMoveError, setSelectedMoveError] = useState('');
    const dialogContentRef = useRef<HTMLDivElement | null>(null);
    const lastWheelNavAtRef = useRef<number>(0);

    const selectedMove = selectedMoveRow ? allMovesByName[selectedMoveRow.rawName] : undefined;
    const selectedMoveIndex = useMemo(() => {
        if (!selectedMoveRow) return -1;
        return rows.findIndex((row) => row.rawName === selectedMoveRow.rawName);
    }, [rows, selectedMoveRow]);
    const canNavigateMoves = rows.length > 1 && selectedMoveIndex >= 0;
    const dialogNavGutterSx = { xs: 6, sm: 7 };

    useEffect(() => {
        if (!selectedMoveRow || !selectedMoveRow?.url) return;

        if (selectedMove) {
            setSelectedMoveStatus('idle');
            setSelectedMoveError('');
            return;
        }

        let isCurrent = true;
        setSelectedMoveStatus('loading');
        setSelectedMoveError('');

        dispatch(loadMove(selectedMoveRow.url))
            .unwrap()
            .then(() => {
                if (isCurrent) setSelectedMoveStatus('idle');
            })
            .catch((err: unknown) => {
                if (!isCurrent) return;
                setSelectedMoveStatus('error');
                setSelectedMoveError((err as Error)?.message ?? String(err));
            });

        return () => {
            isCurrent = false;
        };
    }, [dispatch, selectedMove, selectedMoveRow]);

    const toPrevMove = useCallback(() => {
        if (!canNavigateMoves) return;
        const prevIndex = selectedMoveIndex === 0 ? rows.length - 1 : selectedMoveIndex - 1;
        const nextMove = rows[prevIndex] ?? null;
        setMove(nextMove);
    }, [canNavigateMoves, rows, selectedMoveIndex, setMove]);

    const toNextMove = useCallback(() => {
        if (!canNavigateMoves) return;
        const nextIndex = selectedMoveIndex === rows.length - 1 ? 0 : selectedMoveIndex + 1;
        const nextMove = rows[nextIndex] ?? null;
        setMove(nextMove);
    }, [canNavigateMoves, rows, selectedMoveIndex, setMove]);

    const onDialogWheel = useCallback((e: WheelEvent) => {
        if (!canNavigateMoves) return;

        const target = e.target as HTMLElement | null;
        if (target?.closest('[data-move-pokemon-wheel-zone="true"]')) return;

        const el = dialogContentRef.current;
        if (!el) return;

        const now = Date.now();
        if (now - lastWheelNavAtRef.current < 250) return;

        const { scrollTop, scrollHeight, clientHeight } = el;
        const isScrollable = scrollHeight > clientHeight + 1;
        const atTop = scrollTop <= 0;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

        if (e.deltaY < 0 && (!isScrollable || atTop)) {
            e.preventDefault();
            lastWheelNavAtRef.current = now;
            toPrevMove();
            return;
        }

        if (e.deltaY > 0 && (!isScrollable || atBottom)) {
            e.preventDefault();
            lastWheelNavAtRef.current = now;
            toNextMove();
        }
    }, [canNavigateMoves, toNextMove, toPrevMove]);

    useEffect(() => {
        const el = dialogContentRef.current;
        if (!el || !selectedMoveRow) return;

        el.addEventListener('wheel', onDialogWheel, { passive: false });
        return () => el.removeEventListener('wheel', onDialogWheel);
    }, [selectedMoveRow, onDialogWheel]);

    const onPokemonListWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    const onPokemonListWheelCapture = (e: ReactWheelEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    const { selectedShortEffect, selectedEffect, selectedFlavorText } = useMemo(() => {
        if (!selectedMove) return { selectedShortEffect: '', selectedEffect: '', selectedFlavorText: '' };

        const enEffect = (selectedMove.effect_entries ?? []).find(e => e.language?.name === 'en');
        const enFlavor = (selectedMove.flavor_text_entries ?? []).find(e => e.language?.name === 'en');
        const normalize = (s: string) => s.replaceAll('\f', '\n').trim();

        return {
            selectedShortEffect: enEffect?.short_effect ? normalize(enEffect.short_effect) : '',
            selectedEffect: enEffect?.effect ? normalize(enEffect.effect) : '',
            selectedFlavorText: enFlavor?.flavor_text ? normalize(enFlavor.flavor_text) : '',
        };
    }, [selectedMove]);

    const learnedByPokemon = useMemo(() => {
        if (!selectedMove) return [];
        return (selectedMove.learned_by_pokemon ?? [])
            .map((poke) => ({
                name: poke.name,
                label: toTitleCase(poke.name.replaceAll('-', ' ')),
            }));
    }, [selectedMove]);

    return (
        <Dialog
                open={Boolean(selectedMoveRow)}
                onClose={() => setMove(null)}
                aria-labelledby="move-info-title"
                disableRestoreFocus
                fullWidth
                maxWidth="lg"
                slotProps={{
                    paper: {
                        sx: {
                            position: 'relative',
                            width: { xs: '100%', md: 'min(980px, 100%)' },
                            minHeight: '542px',
                            display: 'flex',
                            flexDirection: 'column',
                        },
                    },
                }}
            >
                <DialogTitle id="move-info-title" sx={{ pl: dialogNavGutterSx, pr: dialogNavGutterSx }}>
                    <Typography component="span">
                        {selectedMoveRow?.name ?? 'Move'}
                    </Typography>
                    {!!selectedMove && (
                        <Stack
                            direction="row"
                            spacing={3}
                            alignItems="center"
                            component="span"
                            sx={{ ml: 3, display: 'inline-flex', verticalAlign: 'middle' }}
                        >
                            <Type
                                typeName={selectedMove.type.name}
                                width="62px"
                                maxWidth="62px"
                            />
                            <Stack direction="row" spacing={1} alignItems="center" component="span" sx={{ display: 'inline-flex' }}>
                                <Box
                                    component="img"
                                    src={`https://img.pokemondb.net/images/icons/move-${selectedMove.damage_class.name}.png`}
                                    alt={selectedMove.damage_class.name}
                                    sx={{ width: 36, height: 24, objectFit: 'contain' }}
                                />
                                <Typography component="span" variant="body2" color="textSecondary" lineHeight={1}>
                                    ({toTitleCase(selectedMove.damage_class.name)})
                                </Typography>
                            </Stack>
                        </Stack>
                    )}
                    <IconButton
                        aria-label="close move info"
                        onClick={() => setMove(null)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <IconButton
                    aria-label="previous move"
                    onClick={toPrevMove}
                    disabled={!canNavigateMoves}
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
                    aria-label="next move"
                    onClick={toNextMove}
                    disabled={!canNavigateMoves}
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

                <DialogContent
                    dividers
                    sx={{ px: dialogNavGutterSx, flex: 1 }}
                    ref={dialogContentRef}
                >
                    {selectedMoveStatus === 'loading' && (
                        <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
                            <CircularProgress size={18} />
                        </Stack>
                    )}

                    {selectedMoveStatus === 'error' && (
                        <Typography color="error" sx={{ mb: 2 }}>
                            {selectedMoveError || 'Failed to load move info.'}
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
                            <Stack spacing={1.5}>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                                        gap: 1,
                                    }}
                                >
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">Power</Typography>
                                        <Typography>{selectedMove?.power ?? '-'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">Accuracy</Typography>
                                        <Typography>{selectedMove?.accuracy ?? '-'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">PP</Typography>
                                        <Typography>{selectedMove?.pp ?? '-'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">Priority</Typography>
                                        <Typography>{selectedMove?.priority ?? '-'}</Typography>
                                    </Box>
                                </Box>

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

                            <Box
                                data-move-pokemon-wheel-zone="true"
                                onWheel={onPokemonListWheel}
                                onWheelCapture={onPokemonListWheelCapture}
                            >
                                <Typography variant="caption" color="textSecondary">
                                    Pokemon that learn {selectedMoveRow?.name ?? 'this move'}
                                </Typography>

                                {(!selectedMove || selectedMoveStatus === 'loading' || selectedMoveStatus === 'error' || learnedByPokemon.length === 0) && (
                                    <Typography color="textSecondary">
                                        No known Pokemon learn {selectedMoveRow?.name ?? 'this move'}.
                                    </Typography>
                                )}
                                {!!selectedMove && selectedMoveStatus !== 'loading' && selectedMoveStatus !== 'error' && learnedByPokemon.length > 0 && (
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
                                        onWheelCapture={onPokemonListWheelCapture}
                                    >
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                                                columnGap: 2,
                                                rowGap: 0.5,
                                            }}
                                        >
                                            {learnedByPokemon.map((poke) => (
                                                <Tooltip title={poke.label} key={poke.name} placement="right" followCursor={true}>
                                                    <Link
                                                        component={RouterLink}
                                                        to={`/showcase?pokemon=${encodeURIComponent(poke.name)}`}
                                                        onClick={() => setMove(null)}
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
                                                </Tooltip>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                    </Box>
                </DialogContent>
            </Dialog>
    );
};

export default MoveModal;
