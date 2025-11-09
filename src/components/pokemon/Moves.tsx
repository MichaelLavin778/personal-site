import { makeStyles } from "@material-ui/core";
import { Box, Typography } from "@mui/material";
import { DataGrid, useGridApiRef, type GridColDef } from '@mui/x-data-grid';
import { useMemo, useState, useRef, useEffect } from "react";
import moveIdToLabel from "../../helpers/pokemonMoveLabeler";
import { useAppSelector } from "../../hooks/hooks";
import type { PokemonsMove } from "../../model/Pokemon";
import type { PokemonMove } from "../../model/PokemonMove";
import { makeSelectPokemonMoves } from "../../state/pokemonMovesSlice";
import Type from "./Type";


const useStyles = makeStyles(() => ({
    cell: {
        alignContent: 'center'
    }
}));

interface MovesProps {
    moves: PokemonsMove[];
    leftColumnHeight: number;
}

const Moves = ({ moves, leftColumnHeight }: MovesProps) => {
    const classes = useStyles();
    const apiRef = useGridApiRef()
    const selectPokemonMoves = useMemo(() => makeSelectPokemonMoves(), []);
    const detailedMoves = useAppSelector((state) => selectPokemonMoves(state, moves));

    const headerSize = 55;
    const rowSize = 52;
    const pageSize = Math.floor((leftColumnHeight - headerSize) / rowSize);

    // controlled pagination model so we can programmatically change pages
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize });
    const lastWheelTimeRef = useRef(0);

    // call this to go next using controlled pagination
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

    // use a native non-passive wheel listener so preventDefault() works reliably
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handler = (e: WheelEvent) => {
            // throttle rapid wheel events (300ms)
            const now = Date.now();
            if (now - lastWheelTimeRef.current < 300) return;
            lastWheelTimeRef.current = now;

            const delta = e.deltaY;
            const threshold = 10; // ignore tiny jitters
            if (delta > threshold) {
                goToNextPage();
                // prevent the default scrolling so user can page through
                e.preventDefault();
            } else if (delta < -threshold) {
                goToPrevPage();
                e.preventDefault();
            }
        };

        el.addEventListener('wheel', handler, { passive: false });
        return () => el.removeEventListener('wheel', handler);
    }, [goToNextPage, goToPrevPage]);

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Move', hideable: false, flex: 1 },
        {
            field: 'type',
            headerName: 'Type',
            width: 110,
            display: 'flex',
            cellClassName: classes.cell,
            renderCell: (params) => <Type typeName={params.row.type} />
        },
        {
            field: 'category',
            headerName: 'Cat.',
            width: 70,
            display: 'flex',
            cellClassName: classes.cell,
            renderCell: (params) => <img src={`https://img.pokemondb.net/images/icons/move-${params.row.category}.png`} alt={params.row.category} width={36} />
        },
        { field: 'power', headerName: 'Power', width: 70 },
        { field: 'accuracy', headerName: 'Acc.', width: 70 },
    ];

    const createData = (
        id: number,
        name: string,
        type: string,
        category: string,
        power: number | undefined,
        accuracy: number | undefined,
        allMoves: PokemonMove[]
    ) => {
        // name
        const nameLabel = moveIdToLabel(name);

        // power
        const powerLabel = power ? String(power) : '-';

        // accuracy
        let accuracyLabel: string | undefined = accuracy ? String(accuracy) : '-';
        const effectEntries = allMoves.find((m => m.name === name))?.effect_entries;
        if (effectEntries?.some(entry => entry.short_effect === "Never misses.")) {
            accuracyLabel = '∞';
        }

        return { id, name: nameLabel, type, category, power: powerLabel, accuracy: accuracyLabel };
    }
    const rows = useMemo(() => (detailedMoves).map((m, i) => createData(i, m.name, m.type.name, m.damage_class.name, m.power, m.accuracy, detailedMoves)), [detailedMoves]);

    return (
        <>
            <Box>
                <Typography component="label" variant="caption" color="textSecondary">Moves</Typography>
            </Box>
            <Box ref={containerRef}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    apiRef={apiRef}
                    paginationModel={paginationModel}
                    onPaginationModelChange={(model) => setPaginationModel(model)}
                    pageSizeOptions={[pageSize]}
                    disableRowSelectionOnClick={true}
                    // filterModel={}
                    sx={{ border: 0 }}
                />
            </Box>
        </>
    );
}

export default Moves;     