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
    LinearProgress,
    Link,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from "@mui/material";
import { DataGrid, type GridColDef, type GridComparatorFn, type GridSortModel } from '@mui/x-data-grid';
import {
    type MouseEvent as ReactMouseEvent,
    type WheelEvent as ReactWheelEvent,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import ShowcaseBottomContext from "../../context/ShowcaseBottomContext";
import { toTitleCase } from "../../helpers/common";
import moveIdToLabel from "../../helpers/pokemonMoveLabeler";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { headerFooterPadding } from "../../model/common";
import type { PokemonsMove, VersionGroupDetails } from "../../model/Pokemon";
import type { PokemonMove } from "../../model/PokemonMove";
import { loadMove, makeSelectPokemonMoves, selectAllMoves } from "../../state/pokemonMovesSlice";
import TutorialPopover from "../TutorialPopover";
import Type from "./Type";

// Keep comparator function references stable so the grid doesn't treat columns as changed every render.
const pwrAndAccSorter: GridComparatorFn = (v1: string, v2: string) => {
    const parseVal = (v: string) => {
        if (v === '-' || v === '') return NaN;
        if (v === '∞' || v === '\u221E') return Infinity;
        const n = Number(v);
        return Number.isFinite(n) ? n : NaN;
    };

    const n1 = parseVal(v1);
    const n2 = parseVal(v2);
    const n1Finite = Number.isFinite(n1);
    const n2Finite = Number.isFinite(n2);

    // 1st) infinity
    if (n1 === Infinity) return 1;
    if (n2 === Infinity) return -1;
    // 2nd) number value
    if (n1Finite && n2Finite) return n1 - n2;
    // 3rd) string "-"
    if (n1Finite && !n2Finite) return 1;
    if (!n1Finite && n2Finite) return -1;

    return v1.localeCompare(v2);
};

const learnSorter: GridComparatorFn = (v1: string, v2: string) => {
    const parseVal = (v: string) => {
        const n = Number(v);
        if (isNaN(n)) return NaN;
        return Number(n);
    };

    const n1 = parseVal(v1);
    const n2 = parseVal(v2);
    const n1Finite = Number.isFinite(n1);
    const n2Finite = Number.isFinite(n2);

    // DESC by default looks better this way
    if (n1Finite && n2Finite) return (n1 as number) - (n2 as number);
    if (n1Finite && !n2Finite) return -1;
    if (!n1Finite && n2Finite) return 1;

    return String(v1).localeCompare(String(v2));
};

type MoveColumnWidths = {
    learned: number;
    name: number;
    type: number;
    category: number;
    power: number;
    accuracy: number;
};

type MoveRow = {
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

const computeMoveColumnWidths = (containerWidth: number): MoveColumnWidths => {
    // Minimums closely match the old "width" + "minWidth" defaults.
    const min: MoveColumnWidths = {
        learned: 70,
        name: 130,
        type: 110,
        category: 70,
        power: 70,
        accuracy: 70,
    };

    const totalMin = Object.values(min).reduce((a, b) => a + b, 0);
    if (!Number.isFinite(containerWidth) || containerWidth <= 0) return min;
    if (containerWidth <= totalMin) return min;

    // Preserve the previous flex proportions (was): 1 / 5 / 1 / 1 / 1 / 1
    const flex = {
        learned: 2,
        name: 24,
        type: 1,
        category: 1,
        power: 1.5,
        accuracy: 1,
    };
    const flexTotal = Object.values(flex).reduce((a, b) => a + b, 0);
    const remaining = containerWidth - totalMin;

    const widths: MoveColumnWidths = {
        learned: min.learned + Math.floor((remaining * flex.learned) / flexTotal),
        name: min.name + Math.floor((remaining * flex.name) / flexTotal),
        type: min.type + Math.floor((remaining * flex.type) / flexTotal),
        category: min.category + Math.floor((remaining * flex.category) / flexTotal),
        power: min.power + Math.floor((remaining * flex.power) / flexTotal),
        accuracy: min.accuracy + Math.floor((remaining * flex.accuracy) / flexTotal),
    };

    // Correct rounding drift by putting any leftover pixels into the name column.
    const sum = Object.values(widths).reduce((a, b) => a + b, 0);
    const drift = containerWidth - sum;
    if (drift !== 0) widths.name += drift;

    return widths;
};


interface MovesProps {
    moves: PokemonsMove[];
    lefColBottom: number;
}

const Moves = ({ moves, lefColBottom }: MovesProps) => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const selectPokemonMoves = useMemo(() => makeSelectPokemonMoves(), []);
    const detailedMoves = useAppSelector((state) => selectPokemonMoves(state, moves));
    const allMovesByName = useAppSelector(selectAllMoves);
    const { bottom: pageBottom } = useContext(ShowcaseBottomContext);
    const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMoveRow, setSelectedMoveRow] = useState<MoveRow | null>(null);
    const [selectedMoveStatus, setSelectedMoveStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [selectedMoveError, setSelectedMoveError] = useState('');
    const dialogContentRef = useRef<HTMLDivElement | null>(null);
    const lastWheelNavAtRef = useRef<number>(0);
    const initialMoveParamRef = useRef(new URLSearchParams(location.search).get('move'));
    const hasConsumedInitialMoveParamRef = useRef(false);

    // for tutorial popover
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Keep column widths stable by computing pixel widths from the container width.
    const [gridWidth, setGridWidth] = useState<number>(0);
    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const measure = () => {
            const next = Math.floor(el.getBoundingClientRect().width);
            setGridWidth((prev) => (prev === next ? prev : next));
        };

        measure();

        const ro = new ResizeObserver(() => measure());
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // move filter buttons
    const levelOption = { label: "Level", shortLabel: "Lv.", value: "level-up" };
	type MoveTypeFilterOption = { label: string; shortLabel?: string; value: string };
	const [moveTypeFilter, setMoveTypeFilter] = useState<MoveTypeFilterOption | null>(levelOption);
    const buttonOptions = [
        levelOption,
        { label: "TM", value: "machine" },
        { label: "Egg", value: "egg" },
        { label: "Tutor", shortLabel: "Ttr", value: "tutor" },
    ];

    // Some Pokémon move names may not exist in the global moves store (e.g., API list mismatch).
    // Count only moves that are actually "loadable" based on what's in the store.
    const loadableMovesTotal = useMemo(
        () => moves.filter((m) => Boolean(m?.move?.name && allMovesByName[m.move.name])).length,
        [moves, allMovesByName]
    );
    const loadedMovesCount = detailedMoves.length;
    const movesLoadedPercent = loadableMovesTotal === 0
        ? 100
        : Math.min(100, Math.max(0, Math.round((loadedMovesCount / loadableMovesTotal) * 100)));

    // values for calc for dynamic page sizing
    const headerSize = 55;
    const rowSize = 52;
    const topSpace = (containerRef.current?.getBoundingClientRect().top || 0) + rowSize + headerSize;
    const contBuffer = windowWidth >= 1200 ? 23 : 50;
    const headerFooterPaddingValue = Number(headerFooterPadding.replace('px', ''));
	const containerSize = windowWidth >= 1200
		? (Math.max(pageBottom - contBuffer, lefColBottom) - topSpace)
		: (windowHeight - headerSize - rowSize - contBuffer - headerFooterPaddingValue * 2);
    const pageSize = Math.floor(containerSize / rowSize);

    // controlled pagination model so we can programmatically change pages
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize });
    const [pageSizeOptions, setPageSizeOptions] = useState([pageSize]);

    // keep paginationModel.pageSize in sync when calculated pageSize changes
    useEffect(() => {
        setPaginationModel((prev) => {
            const maxPage = pageSize;
            const newPage = Math.min(prev.page, maxPage);
            return { ...prev, pageSize, page: newPage };
        });
        setPageSizeOptions([pageSize]);
    }, [pageSize, pageBottom, lefColBottom]);

    // track window height and width
    const handleResize = () => {
        setWindowWidth(window.innerWidth);
        setWindowHeight(window.innerHeight);
    };
    useEffect(() => {
        window.addEventListener('resize', handleResize);
        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // intial sort and sort model controls
    const intialSort = { field: 'learned', sort: 'asc' as const };
    const [sortModel, setSortModel] = useState<GridSortModel>([intialSort]);

    // override scrolling in the table to turn the table pages instead
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const goToNextPage = () => {
            const { page, pageSize } = paginationModel;
            if (detailedMoves.length === 0) return;

            const maxPage = Math.max(0, Math.ceil(detailedMoves.length / pageSize) - 1);
            setPaginationModel({ ...paginationModel, page: Math.min(page + 1, maxPage) });
        };

        const goToPrevPage = () => {
            const { page } = paginationModel;
            setPaginationModel({ ...paginationModel, page: Math.max(0, page - 1) });
        };

        const handler = (e: WheelEvent) => {
            e.preventDefault();

            const delta = e.deltaY;
            const threshold = 10; // ignore tiny jitters
            if (delta > threshold) goToNextPage();
            // prevent the default scrolling so user can page through
            else if (delta < -threshold) goToPrevPage();
        };

        el.addEventListener('wheel', handler, { passive: false });
        return () => el.removeEventListener('wheel', handler);
    });

    // handle move type filter change
        const handleMoveTypeFilter = (
		_event: ReactMouseEvent<HTMLElement, MouseEvent>,
		newMoveTypeFilter: string | null
	) => {
        const newOption = buttonOptions.find(opt => opt.value === newMoveTypeFilter) || null;
        setMoveTypeFilter(newOption);
        if (newMoveTypeFilter === "level-up") setSortModel([intialSort]);
        // TODO: look up TM numbers and then uncomment code below to default sort it
        // else if (newMoveTypeFilter === "machine") setSortModel([intialSort]);
        else setSortModel([]);
    };

    // get version group details for a move - comes from pokemon's data
    const getVGs = (mvs: PokemonsMove[], moveName: string) =>
		mvs.find(move => move.move.name === moveName)?.version_group_details;

    const getMoveUrl = (mvs: PokemonsMove[], moveName: string) =>
        mvs.find(move => move.move.name === moveName)?.move.url ?? '';

    const columnWidths = useMemo(() => computeMoveColumnWidths(gridWidth), [gridWidth]);

    const setMoveUrlParam = useCallback((row: MoveRow | null) => {
        const params = new URLSearchParams(location.search);

        if (row) {
            params.set('move', row.rawName);
            params.delete('ability');
        } else
            params.delete('move');

        const nextSearch = params.toString();
        navigate(
            {
                pathname: location.pathname,
                search: nextSearch ? `?${nextSearch}` : '',
                hash: location.hash,
            },
            { replace: true }
        );
    }, [location.hash, location.pathname, location.search, navigate]);

    const openMoveDialog = useCallback((row: MoveRow) => {
        setSelectedMoveRow(row);
        setIsDialogOpen(true);
        setMoveUrlParam(row);
    }, [setMoveUrlParam]);

    const closeMoveDialog = () => {
        setIsDialogOpen(false);
        setMoveUrlParam(null);
    };

    const columns = useMemo<GridColDef[]>(() => [
        {
            field: 'learned',
            headerName: moveTypeFilter?.shortLabel || moveTypeFilter?.label || "Lrn",
            filterable: false,
            align: 'right',
            width: columnWidths.learned,
            sortComparator: learnSorter
        },
        {
            field: 'name',
            headerName: 'Move',
            hideable: false,
            width: columnWidths.name,
            minWidth: 130,
            renderCell: (params) => {
                const row = params.row as MoveRow;
                return (
                    <Link
                        component="button"
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            event.currentTarget.blur();
                            openMoveDialog(row);
                        }}
                        variant="body2"
                        sx={{
                            p: 0,
                            border: 0,
                            bgcolor: 'transparent',
                            color: 'textPrimary',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            textAlign: 'left',
                            font: 'inherit',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                        aria-label={`Open move info for ${row.name}`}
                    >
                        {row.name}
                    </Link>
                );
            }
        },
        {
            field: 'type',
            headerName: 'Type',
            width: columnWidths.type,
            minWidth: 90,
            display: 'flex',
            renderCell: (params) => <Type typeName={params.row.type} />
        },
        {
            field: 'category',
            headerName: 'Cat.',
            width: columnWidths.category,
            display: 'flex',
            renderCell: (params) => <img src={`https://img.pokemondb.net/images/icons/move-${params.row.category}.png`} alt={params.row.category} width={36} />
        },
        {
            field: 'power',
            headerName: 'Power',
            width: columnWidths.power,
            sortComparator: pwrAndAccSorter
        },
        {
            field: 'accuracy',
            headerName: 'Acc.',
            width: columnWidths.accuracy,
            sortComparator: pwrAndAccSorter
        },
    ], [columnWidths, moveTypeFilter?.label, moveTypeFilter?.shortLabel, openMoveDialog]);

    const createData = (
        id: number,
        vgs: VersionGroupDetails[] | undefined,
        name: string,
        type: string,
        category: string,
        power: number | undefined,
        accuracy: number | undefined,
        allMoves: PokemonMove[],
        url: string
    ): MoveRow => {
        // learned by and learned at
        const vg = vgs?.at(-1);
        let learned: string;
        switch (vg?.move_learn_method.name) {
            case "level-up":
                learned = `${vg?.level_learned_at || 0}`;
                break;
            case "machine":
                learned = "TM";
                break;
            case "tutor":
                learned = "Tutor";
                break;
            case "egg":
                learned = "Egg";
                break;
            default:
                learned = "Other";
        }

        // name
        const nameLabel = moveIdToLabel(name);

        // power
        const powerLabel = power ? String(power) : '-';

        // accuracy
        let accuracyLabel: string | undefined = accuracy ? String(accuracy) : '-';
        const effectEntries = allMoves.find((m => m.name === name))?.effect_entries;
        if (effectEntries?.some(entry => entry.short_effect === "Never misses."))
            accuracyLabel = '∞';

        return {
            id,
            learned,
            name: nameLabel,
            rawName: name,
            url,
            type,
            category,
            power: powerLabel,
            accuracy: accuracyLabel,
        };
    }

    const rows = useMemo(
        () => (detailedMoves)
            .filter((m) => {
                if (!moveTypeFilter?.value) return true;
                return getVGs(moves, m.name)?.at(-1)?.move_learn_method.name === moveTypeFilter.value;
            })
            .map((m, i) => {
                const vgs = getVGs(moves, m.name);
                return createData(
                    i,
                    vgs,
                    m.name,
                    m.type.name,
                    m.damage_class.name,
                    m.power,
                    m.accuracy,
                    detailedMoves,
                    getMoveUrl(moves, m.name)
                );
            }),
        [detailedMoves, moveTypeFilter, moves]
    );

    useEffect(() => {
        if (hasConsumedInitialMoveParamRef.current) return;

        const moveParam = initialMoveParamRef.current;
        if (!moveParam) {
            hasConsumedInitialMoveParamRef.current = true;
            return;
        }

        const moveFromUrl = rows.find((row) => row.rawName === moveParam);
        if (!moveFromUrl) return;

        setSelectedMoveRow((current) => {
            if (current?.rawName === moveParam) return current;
            return moveFromUrl;
        });
        setIsDialogOpen(true);
        hasConsumedInitialMoveParamRef.current = true;
    }, [rows]);

    const selectedMove = selectedMoveRow ? allMovesByName[selectedMoveRow.rawName] : undefined;
    const selectedMoveIndex = useMemo(() => {
        if (!selectedMoveRow) return -1;
        return rows.findIndex((row) => row.rawName === selectedMoveRow.rawName);
    }, [rows, selectedMoveRow]);
    const canNavigateMoves = rows.length > 1 && selectedMoveIndex >= 0;
    const dialogNavGutterSx = { xs: 6, sm: 7 };

    useEffect(() => {
        if (!isDialogOpen || !selectedMoveRow?.url) return;

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
    }, [dispatch, isDialogOpen, selectedMove, selectedMoveRow?.url]);

    const toPrevMove = useCallback(() => {
        if (!canNavigateMoves) return;
        const prevIndex = selectedMoveIndex === 0 ? rows.length - 1 : selectedMoveIndex - 1;
        const nextMove = rows[prevIndex] ?? null;
        setSelectedMoveRow(nextMove);
        setMoveUrlParam(nextMove);
    }, [canNavigateMoves, rows, selectedMoveIndex, setMoveUrlParam]);

    const toNextMove = useCallback(() => {
        if (!canNavigateMoves) return;
        const nextIndex = selectedMoveIndex === rows.length - 1 ? 0 : selectedMoveIndex + 1;
        const nextMove = rows[nextIndex] ?? null;
        setSelectedMoveRow(nextMove);
        setMoveUrlParam(nextMove);
    }, [canNavigateMoves, rows, selectedMoveIndex, setMoveUrlParam]);

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
        if (!el || !isDialogOpen) return;

        el.addEventListener('wheel', onDialogWheel, { passive: false });
        return () => el.removeEventListener('wheel', onDialogWheel);
    }, [isDialogOpen, onDialogWheel]);

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
        <>
            {/* Label */}
            <Box>
                <Typography component="label" variant="caption" color="textSecondary">Moves</Typography>
            </Box>

            {/* Table Header */}
            <Box display="flex" alignItems="center" gap={1}>
                {/* Filter */}
                <ToggleButtonGroup
                    value={moveTypeFilter?.value}
                    exclusive={true}
                    onChange={handleMoveTypeFilter}
                    aria-label="move learned by filter"
                    fullWidth={true}
                >
                    {buttonOptions.map((label) => (
                        <ToggleButton
                            key={label.label}
                            value={label.value}
                            sx={{ lineHeight: 0.25, width: 70 }}
                        >
                            {label.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>

                {/* Loading Progress */}
                {movesLoadedPercent < 100 && (
                    <Box
                        minWidth={120}
                        display={{ xs: 'none', sm: 'flex' }}
                        flexDirection="column"
                        alignItems="flex-end"
                        justifyContent="center"
                    >
                        <Typography variant="caption" color="textSecondary" lineHeight={1}>
                            {movesLoadedPercent}%
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={movesLoadedPercent}
                            sx={{ width: 120, height: 6, borderRadius: 3 }}
                        />
                    </Box>
                )}
            </Box>

            {/* Moves Table */}
            <Box ref={containerRef} minHeight={{ lg: containerSize }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={(model) => setPaginationModel(model)}
                    pageSizeOptions={pageSizeOptions}
                    disableRowSelectionOnClick={true}
                    sortModel={sortModel}
                    onSortModelChange={(model) => setSortModel(model)}
                    sx={{
                        border: 0,
                        overflow: 'hidden',
                        // Hard-hide scrollbars inside the grid (native + MUI overlay).
                        '& .MuiDataGrid-virtualScroller': {
                            scrollbarWidth: 'none', // Firefox
                            msOverflowStyle: 'none', // IE/Edge legacy
                        },
                        '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
                            width: 0,
                            height: 0,
                            display: 'none',
                        },
                        // MUI renders an overlay scrollbar element in some modes.
                        '& .MuiDataGrid-scrollbar': {
                            display: 'none',
                        },
                    }}
                />
            </Box>

            {/* Moves Modal */}
            <Dialog
                open={isDialogOpen}
                onClose={closeMoveDialog}
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
                        onClick={closeMoveDialog}
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
                                                        onClick={closeMoveDialog}
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

            {/* Tutorial */}
            {containerRef.current && (
                <TutorialPopover anchorEl={containerRef.current} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                    All data is pulled from <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a>. Moves table uses a DataGrid which <b>dynamically</b> sizes between the bottom of the left column and the bottom of the page.
                </TutorialPopover>
            )}
        </>
    );
}

export default Moves;     
