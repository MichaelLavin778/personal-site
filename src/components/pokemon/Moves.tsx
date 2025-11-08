import { makeStyles } from "@material-ui/core";
import { useMemo } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { toTitleCase } from "../../helpers/text";
import { useAppSelector } from "../../hooks/hooks";
import type { PokemonsMove } from "../../model/Pokemon";
import type { PokemonMove } from "../../model/PokemonMove";
import { makeSelectPokemonMoves } from "../../state/pokemonMovesSlice";
import Type from "./Type";


const useStyles = makeStyles(() => ({
    lastRow: {
        '&:last-child td': {
            border: 0
        },
        '&:last-child th': {
            border: 0
        }
    }
}));

interface MovesProps {
    moves: PokemonsMove[];
    leftColumnHeight: number;
}

const Moves = ({ moves, leftColumnHeight }: MovesProps) => {
    const classes = useStyles();
    const selectPokemonMoves = useMemo(() => makeSelectPokemonMoves(), []);
    const detailedMoves = useAppSelector((state) => selectPokemonMoves(state, moves));

    const createData = (
        name: string,
        type: string,
        power: number | undefined,
        accuracy: number | undefined,
        allMoves: PokemonMove[]
    ) => {
        // name
        let nameLabel = "";
        switch (name) {
            case 'double-edge':
                nameLabel = "Double-Edge"
                break;
            case 'self-destruct':
                nameLabel = "Self-Destruct"
                break;
            case 'soft-boiled':
                nameLabel = "Soft-Boiled"
                break;
            case 'lock-on':
                nameLabel = "Lock-On"
                break;
            case 'mud-slap':
                nameLabel = "Mud-Slap"
                break;
            case 'will-o-wisp':
                nameLabel = "Will-O-Wisp"
                break;
            case 'u-turn':
                nameLabel = "U-Turn"
                break;
            case 'wake-up-slap':
                nameLabel = "Wake-Up Slap"
                break;
            case 'x-scissor':
                nameLabel = "X-Scissor"
                break;
            case 'v-create':
                nameLabel = "V-create"
                break;
            case 'baby-doll-eyes':
                nameLabel = "Baby-Doll Eyes"
                break;
            case 'freeze-dry':
                nameLabel = "Freeze-Dry"
                break;
            case 'power-up-punch':
                nameLabel = "Power-Up Punch"
                break;
            case 'topsy-turvy':
                nameLabel = "Topsy-Turvy"
                break;
            case 'trick-or-treat':
                nameLabel = "Trick-or-Treat"
                break;
            case 'all-out-pummeling':
                nameLabel = "All-Out Pummeling"
                break;
            case 'multi-attack':
                nameLabel = "Multi-Attack"
                break;
            case 'never-ending-nightmare':
                nameLabel = "Never-Ending Nightmare"
                break;
            case 'savage-spin-out':
                nameLabel = "Savage Spin-Out"
                break;
            case 'soul-stealing-7-star-strike':
                nameLabel = "Soul-Stealing 7-Star Strike"
                break;
            default:
                nameLabel = toTitleCase(name.replaceAll('-', ' ').replaceAll('G Max', 'G-Max'))
        }

        // power
        const powerLabel = power ?? '-';

        // accuracy
        let accuracyLabel: string | number | undefined = accuracy;
        if (!accuracyLabel) {
            const effectEntries = allMoves.find((m => m.name === name))?.effect_entries;
            if (effectEntries?.some(entry => entry.short_effect === "Never misses.")) {
                accuracyLabel = '∞';
            } else {
                accuracyLabel = '-';
            }
        }

        return { name: nameLabel, type, power: powerLabel, accuracy: accuracyLabel };
    }
    const rows = useMemo(() => (detailedMoves).map(m => createData(m.name, m.type.name, m.power, m.accuracy, detailedMoves)), [detailedMoves]);

    return (
        <>
            <Box>
                <Typography component="label" variant="caption" color="textSecondary">Moves</Typography>
            </Box>
            <TableContainer sx={{ maxHeight: leftColumnHeight }}>
                <Table aria-label="moves table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell align="right">Type</TableCell>
                            <TableCell align="right">Power</TableCell>
                            <TableCell align="right">Accuracy</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow
                                key={row.name}
                                className={classes.lastRow}
                            >
                                <TableCell component="th" scope="row">
                                    {row.name}
                                </TableCell>
                                <TableCell align="right" sx={{ justifyItems: 'flex-end' }}><Type typeName={row.type} /></TableCell>
                                <TableCell align="right">{row.power}</TableCell>
                                <TableCell align="right">{row.accuracy}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

export default Moves;     