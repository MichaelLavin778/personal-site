import {
    Box,
    LinearProgress,
    Link,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import { DataGrid, type GridColDef, type GridComparatorFn, type GridSortModel } from '@mui/x-data-grid';
import {
    type MouseEvent as ReactMouseEvent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ShowcaseBottomContext from "../../context/ShowcaseBottomContext";
import moveIdToLabel from "../../helpers/pokemonMoveLabeler";
import { useAppSelector } from "../../hooks/hooks";
import { useElementRect } from "../../hooks/useElementRect";
import { useViewportSize } from "../../hooks/useViewportSize";
import { headerFooterPaddingPx } from "../../model/common";
import type { PokemonsMove, VersionGroupDetails } from "../../model/Pokemon";
import type { EffectEntry } from "../../model/PokemonMove";
import { makeSelectPokemonMoves } from "../../state/pokemonMovesSlice";
import TutorialPopover from "../TutorialPopover";
import MoveModal, { type MoveRow } from "./MoveModal";
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

const createData = (
    id: number,
    vgs: VersionGroupDetails[] | undefined,
    name: string,
    type: string,
    category: string,
    power: number | undefined,
    accuracy: number | undefined,
    effectEntries: EffectEntry[] | undefined,
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

type MoveColumnWidths = {
    learned: number;
    name: number;
    type: number;
    category: number;
    power: number;
    accuracy: number;
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

type MoveTypeFilterOption = { label: string; shortLabel?: string; value: string };
const levelOption: MoveTypeFilterOption = { label: "Level", shortLabel: "Lv.", value: "level-up" };
const buttonOptions: MoveTypeFilterOption[] = [
    levelOption,
    { label: "TM", value: "machine" },
    { label: "Egg", value: "egg" },
    { label: "Tutor", shortLabel: "Ttr", value: "tutor" },
];
const intialSort = { field: 'learned', sort: 'asc' as const };

const Moves = ({ moves, lefColBottom }: MovesProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const selectPokemonMoves = useMemo(() => makeSelectPokemonMoves(), []);
    const detailedMoves = useAppSelector((state) => selectPokemonMoves(state, moves));

    const pokemonMoveDetailsByName = useMemo(
        () => new Map(moves.map((move) => [
            move.move.name,
            {
                url: move.move.url,
                versionGroupDetails: move.version_group_details,
            },
        ])),
        [moves]
    );
    const allRows = useMemo(
        () => (detailedMoves)
            .filter((m) => pokemonMoveDetailsByName
                .get(m.name)
                ?.versionGroupDetails
                .at(-1))
            .map((m, i) => {
                const pokemonMoveDetails = pokemonMoveDetailsByName.get(m.name);
                return createData(
                    i,
                    pokemonMoveDetails?.versionGroupDetails,
                    m.name,
                    m.type.name,
                    m.damage_class.name,
                    m.power,
                    m.accuracy,
                    m.effect_entries,
                    pokemonMoveDetails?.url ?? ''
                );
            }),
        [detailedMoves, pokemonMoveDetailsByName]
    );
    const selectedMoveParam = useMemo(
        () => new URLSearchParams(location.search).get('move'),
        [location.search]
    );

    const selectedMoveRow = useMemo(
        () => allRows.find((row) => row.rawName === selectedMoveParam) ?? null,
        [allRows, selectedMoveParam]
    );

    // size controls
    const { bottom: pageBottom } = useContext(ShowcaseBottomContext);
    const { height: windowHeight, width: windowWidth } = useViewportSize();

    // for tutorial popover
    const containerRef = useRef<HTMLDivElement | null>(null);
    const tableRect = useElementRect(containerRef);

    // move filter buttons
    const [moveTypeFilter, setMoveTypeFilter] = useState<MoveTypeFilterOption | null>(levelOption);

    const loadableMovesTotal = moves.length;
    const loadedMovesCount = detailedMoves.length;
    const movesLoadedPercent = loadableMovesTotal === 0
        ? 100
        : Math.min(100, Math.max(0, Math.round((loadedMovesCount / loadableMovesTotal) * 100)));

    // values for calculating dynamic page sizing
    const columnHeaderSize = 55;
    const rowSize = 52;
    const gridFooterSize = 52;
    const mobileMinTableRows = 7;
    const contBuffer = windowWidth >= 1200 ? 23 : 50;
    const targetBottom = windowWidth >= 1200
        ? Math.max(pageBottom - contBuffer, lefColBottom)
        : windowHeight - headerFooterPaddingPx - contBuffer;
    const minAvailableTableHeight = windowWidth >= 1200
        ? 0
        : columnHeaderSize + gridFooterSize + rowSize * mobileMinTableRows;
    const availableTableHeight = tableRect.top > 0
        ? Math.max(minAvailableTableHeight, targetBottom - tableRect.top)
        : columnHeaderSize + gridFooterSize + rowSize * 4;
    const gridChromeSize = columnHeaderSize + gridFooterSize;
    const pageSize = Math.max(1, Math.floor((availableTableHeight - gridChromeSize) / rowSize));
    const tableHeight = Math.min(availableTableHeight, gridChromeSize + pageSize * rowSize);

    // controlled pagination model so we can programmatically change pages
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize });
    const pageSizeOptions = useMemo(
        () => Array.from(new Set([paginationModel.pageSize, pageSize])),
        [paginationModel.pageSize, pageSize]
    );

    // keep paginationModel.pageSize in sync when calculated pageSize changes
    useEffect(() => {
        setPaginationModel((prev) => {
            const maxPage = Math.max(0, Math.ceil(detailedMoves.length / pageSize) - 1);
            const newPage = Math.min(prev.page, maxPage);
            if (prev.page === newPage && prev.pageSize === pageSize) return prev;
            return { ...prev, pageSize, page: newPage };
        });
    }, [detailedMoves.length, pageSize]);

    // intial sort and sort model controls
    const [sortModel, setSortModel] = useState<GridSortModel>([intialSort]);

    // override scrolling in the table to turn the table pages instead
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const goToNextPage = () => {
            if (detailedMoves.length === 0) return;

            setPaginationModel((prev) => {
                const maxPage = Math.max(0, Math.ceil(detailedMoves.length / prev.pageSize) - 1);
                const page = Math.min(prev.page + 1, maxPage);
                return page === prev.page ? prev : { ...prev, page };
            });
        };

        const goToPrevPage = () => {
            setPaginationModel((prev) => {
                const page = Math.max(0, prev.page - 1);
                return page === prev.page ? prev : { ...prev, page };
            });
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
    }, [detailedMoves.length]);

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

    const columnWidths = useMemo(() => computeMoveColumnWidths(tableRect.width), [tableRect.width]);

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

    const setMove = useCallback((row: MoveRow | null = null) => {
        setMoveUrlParam(row);
    }, [setMoveUrlParam]);

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
                            setMove(row);
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
    ], [columnWidths, moveTypeFilter?.label, moveTypeFilter?.shortLabel, setMove]);

    const rows = useMemo(
        () => moveTypeFilter?.value ? allRows.filter((m) => pokemonMoveDetailsByName
            .get(m.rawName)
            ?.versionGroupDetails
            .at(-1)
            ?.move_learn_method
            .name === moveTypeFilter.value) : allRows, [allRows, moveTypeFilter, pokemonMoveDetailsByName]);

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
            <Box ref={containerRef} sx={{ height: tableHeight, minHeight: tableHeight, overflow: 'hidden' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    rowHeight={rowSize}
                    columnHeaderHeight={columnHeaderSize}
                    paginationModel={paginationModel}
                    onPaginationModelChange={(model) => setPaginationModel(model)}
                    pageSizeOptions={pageSizeOptions}
                    disableRowSelectionOnClick={true}
                    sortModel={sortModel}
                    onSortModelChange={(model) => setSortModel(model)}
                    sx={{
                        height: '100%',
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
                        '& .MuiDataGrid-footerContainer': {
                            height: gridFooterSize,
                            minHeight: gridFooterSize,
                            maxHeight: gridFooterSize,
                            overflow: 'hidden',
                        },
                        '& .MuiTablePagination-root': {
                            overflow: 'hidden',
                        },
                        '& .MuiTablePagination-toolbar': {
                            height: gridFooterSize,
                            minHeight: gridFooterSize,
                            overflow: 'hidden',
                        },
                    }}
                />
            </Box>

            <MoveModal rows={rows} selectedMoveRow={selectedMoveRow} setMove={setMove} />

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
