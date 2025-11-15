import { Backdrop, Box, Popover, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { DataGrid, type GridColDef, type GridComparatorFn, type GridSortModel, useGridApiRef } from '@mui/x-data-grid';
import { type MouseEvent as ReactMouseEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import ShowcaseBottomContext from "../../context/ShowcaseBottomContext";
import TutorialContext from "../../context/TutorialContext";
import moveIdToLabel from "../../helpers/pokemonMoveLabeler";
import { useAppSelector } from "../../hooks/hooks";
import type { PokemonsMove, VersionGroupDetails } from "../../model/Pokemon";
import type { PokemonMove } from "../../model/PokemonMove";
import { makeSelectPokemonMoves } from "../../state/pokemonMovesSlice";
import Type from "./Type";


interface MovesProps {
    moves: PokemonsMove[];
    lefColBottom: number;
}

const Moves = ({ moves, lefColBottom }: MovesProps) => {
    const apiRef = useGridApiRef()
    const selectPokemonMoves = useMemo(() => makeSelectPokemonMoves(), []);
    const detailedMoves = useAppSelector((state) => selectPokemonMoves(state, moves));
    const { bottom: pageBottom } = useContext(ShowcaseBottomContext);

    // use a native non-passive wheel listener so preventDefault() works reliably
    const containerRef = useRef<HTMLDivElement | null>(null);

    // tutorial controls
    const { showTutorial } = useContext(TutorialContext);
    // Anchor should be an HTMLElement so Popover can position itself over the table
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = showTutorial && !!anchorEl;

    // move filter buttons
    const levelOption = { label: "Level", shortLabel: "Lv.", value: "level-up" };
    const [moveTypeFilter, setMoveTypeFilter] = useState<{ label: string, shortLabel?: string, value: string } | null>(levelOption);
    const buttonOptions = [
        levelOption,
        { label: "TM", value: "machine" },
        { label: "Egg", value: "egg" },
        { label: "Tutor", shortLabel: "Ttr", value: "tutor" },
    ];

    // values for calc for dynamic page sizing
    const headerSize = 55;
    const rowSize = 52;
    const topSpace = (containerRef.current?.getBoundingClientRect().top || 0) + rowSize + headerSize;
    const contBuffer = 15;
    const containerSize = (Math.max(pageBottom - contBuffer, lefColBottom) - topSpace);
    const pageSize = Math.max(Math.floor(containerSize / rowSize), 5);

    // controlled pagination model so we can programmatically change pages
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize });
    const [pageSizeOptions, setPageSizeOptions] = useState([pageSize]);
    const lastWheelTimeRef = useRef(0);

    // keep paginationModel.pageSize in sync when calculated pageSize changes
    useEffect(() => {
        setPaginationModel((prev) => {
            const maxPage = pageSize;
            const newPage = Math.min(prev.page, maxPage);
            return { ...prev, pageSize, page: newPage };
        });
        setPageSizeOptions([pageSize]);
    }, [pageSize, pageBottom, lefColBottom]);

    // when tutorial is shown, anchor the popover to the container that holds the DataGrid
    useEffect(() => {
        if (showTutorial) setAnchorEl(containerRef.current || null);
        else setAnchorEl(null);
    }, [showTutorial]);

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
            const now = Date.now();
            // throttle rapid wheel events (300ms)
            if (now - lastWheelTimeRef.current < 300) return;

            lastWheelTimeRef.current = now;

            const delta = e.deltaY;
            const threshold = 10; // ignore tiny jitters
            if (delta > threshold) goToNextPage();
            // prevent the default scrolling so user can page through
            else if (delta < -threshold) goToPrevPage();
        };

        el.addEventListener('wheel', handler, { passive: false });
        return () => el.removeEventListener('wheel', handler);
    });

    const handleMoveTypeFilter = (_event: ReactMouseEvent<HTMLElement, MouseEvent>, newMoveTypeFilter: string | null) => {
        const newOption = buttonOptions.find(opt => opt.value === newMoveTypeFilter) || null;
        setMoveTypeFilter(newOption);
        if (newMoveTypeFilter === "level-up") setSortModel([intialSort]);
        // TODO: look up TM numbers and then uncomment code below to default sort it
        // else if (newMoveTypeFilter === "machine") setSortModel([intialSort]);
        else setSortModel([]);
    };

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

    // get version group details for a move - comes from pokemon's data
    const getVGs = (mvs: PokemonsMove[], moveName: string) => mvs.find(move => move.move.name === moveName)?.version_group_details;

    const columns: GridColDef[] = [
        {
            field: 'learned',
            headerName: moveTypeFilter?.shortLabel || moveTypeFilter?.label || "Lrn",
            filterable: false,
            align: 'right',
            width: 70,
            sortComparator: learnSorter
        },
        {
            field: 'name',
            headerName: 'Move',
            hideable: false,
            flex: 1,
            minWidth: 130
        },
        {
            field: 'type',
            headerName: 'Type',
            width: 110,
            minWidth: 90,
            display: 'flex',
            renderCell: (params) => <Type typeName={params.row.type} />
        },
        {
            field: 'category',
            headerName: 'Cat.',
            width: 70,
            display: 'flex',
            renderCell: (params) => <img src={`https://img.pokemondb.net/images/icons/move-${params.row.category}.png`} alt={params.row.category} width={36} />
        },
        {
            field: 'power',
            headerName: 'Power',
            width: 70,
            sortComparator: pwrAndAccSorter
        },
        {
            field: 'accuracy',
            headerName: 'Acc.',
            width: 70,
            sortComparator: pwrAndAccSorter
        },
    ];

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
        if (effectEntries?.some(entry => entry.short_effect === "Never misses.")) accuracyLabel = '∞';

        return { id, learned, name: nameLabel, type, category, power: powerLabel, accuracy: accuracyLabel };
    }

    const rows = useMemo(
        () => (detailedMoves)
            .filter(m => moveTypeFilter?.value ? getVGs(moves, m.name)?.at(-1)?.move_learn_method.name === moveTypeFilter.value : m)
            .map((m, i) => {
                const vgs = getVGs(moves, m.name);
                return createData(i, vgs, m.name, m.type.name, m.damage_class.name, m.power, m.accuracy, detailedMoves)
            }), [detailedMoves, moveTypeFilter, moves]);

    return (
        <>
            {/* Label */}
            <Box>
                <Typography component="label" variant="caption" color="textSecondary">Moves</Typography>
            </Box>

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

            {/* Moves Table */}
            <Box ref={containerRef} minHeight={containerSize}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    apiRef={apiRef}
                    paginationModel={paginationModel}
                    onPaginationModelChange={(model) => setPaginationModel(model)}
                    pageSizeOptions={pageSizeOptions}
                    disableRowSelectionOnClick={true}
                    sortModel={sortModel}
                    onSortModelChange={(model) => setSortModel(model)}
                    sx={{ border: 0 }}
                />
            </Box>

            {/* Tutorial */}
            {open && (
                <Backdrop
                    open={open}
                    onClick={() => setAnchorEl(null)}
                    sx={{ zIndex: (theme) => theme.zIndex.modal - 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
                />
            )}
            <Popover open={open} onClose={() => setAnchorEl(null)} anchorEl={anchorEl} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                <Typography maxWidth={300} padding={2} border={1} borderRadius={2}>
                    All data is pulled from <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a>. Moves table uses a DataGrid which <b>dynamically</b> sizes between the bottom of the left column and the bottom of the page.
                </Typography>
            </Popover>
        </>
    );
}

export default Moves;     