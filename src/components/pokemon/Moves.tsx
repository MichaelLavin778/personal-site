import { Box, LinearProgress, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { DataGrid, type GridColDef, type GridComparatorFn, type GridSortModel } from '@mui/x-data-grid';
import { type MouseEvent as ReactMouseEvent, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import ShowcaseBottomContext from "../../context/ShowcaseBottomContext";
import moveIdToLabel from "../../helpers/pokemonMoveLabeler";
import { useAppSelector } from "../../hooks/hooks";
import { headerFooterPadding } from "../../model/common";
import type { PokemonsMove, VersionGroupDetails } from "../../model/Pokemon";
import type { PokemonMove } from "../../model/PokemonMove";
import { makeSelectPokemonMoves, selectAllMoves } from "../../state/pokemonMovesSlice";
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
    const selectPokemonMoves = useMemo(() => makeSelectPokemonMoves(), []);
    const detailedMoves = useAppSelector((state) => selectPokemonMoves(state, moves));
    const allMovesByName = useAppSelector(selectAllMoves);
    const { bottom: pageBottom } = useContext(ShowcaseBottomContext);
    const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

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

    const columnWidths = useMemo(() => computeMoveColumnWidths(gridWidth), [gridWidth]);

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
            minWidth: 130
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
    ], [columnWidths, moveTypeFilter?.label, moveTypeFilter?.shortLabel]);

    const createData = (
        id: number,
        vgs: VersionGroupDetails[] | undefined,
        name: string,
        type: string,
        category: string,
        power: number | undefined,
        accuracy: number | undefined,
        allMoves: PokemonMove[]
    ) => {
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
                    detailedMoves
                );
            }),
        [detailedMoves, moveTypeFilter, moves]
    );

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