import { makeStyles } from "@material-ui/core";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import type { PokemonMove } from "../../model/Pokemon";

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
    moves: PokemonMove[] | undefined;
    leftColumnHeight: number;
}

const Moves = ({ moves, leftColumnHeight }: MovesProps) => {
    const classes = useStyles();

    const createData = (
        name: string,
    ) => {        
        return { name };
    }
    const rows = (moves || []).map(m => createData(m.move.name));

    return (
        <>
            <Typography component="label" variant="caption" color="textSecondary">Moves</Typography>
            <TableContainer sx={{ maxHeight: leftColumnHeight }}>
                <Table aria-label="stats table">
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            {/* <TableCell align="right">Base</TableCell> */}
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
                                {/* <TableCell align="right">{row.base}</TableCell> */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

export default Moves;     