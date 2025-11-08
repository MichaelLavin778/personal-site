import { makeStyles } from "@material-ui/core";
import { Box, FormHelperText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import type { PokemonStat } from "../../model/Pokemon";

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

interface StatsProps {
    stats: PokemonStat[] | undefined;
}

const Stats = ({ stats }: StatsProps) => {
    const classes = useStyles();

    const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    const fallbackStats: PokemonStat[] = statNames.map((name, i) => ({ base_stat: 0, effort: 0, stat: { name, url: `https://pokeapi.co/api/v2/stat/${i + 1}/` } }));

    const maxLevel = 100;
    const badNature = 0.9;
    const goodNature = 1.1;
    const maxEVs = 252;
    const maxIVs = 31;

    const createData = (
        name: string,
        base: number,
    ) => {
        // other stats
        let min = Math.floor((Math.floor(2 * base * maxLevel / 100) + 5) * badNature);
        let max = Math.floor((Math.floor(((2 * base + maxIVs + Math.floor(maxEVs / 4)) * maxLevel) / 100) + 5) * goodNature);

        if (name === 'hp') {
            min = Math.floor(2 * base * maxLevel / 100) + maxLevel + 10;
            max = Math.floor(((2 * base + maxIVs + Math.floor(maxEVs / 4)) * maxLevel) / 100) + maxLevel + 10;
        }
        return { name, base, min, max };
    }
    const rows = (stats || fallbackStats).map(s => createData(s.stat.name, s.base_stat));

    return (
        <>
            <Box>
                <Typography component="label" variant="caption" color="textSecondary">Stats</Typography>
            </Box>
            <TableContainer>
                <Table size="small" aria-label="stats table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell align="right">Base</TableCell>
                            <TableCell align="right">Min*</TableCell>
                            <TableCell align="right">Max*</TableCell>
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
                                <TableCell align="right">{row.base}</TableCell>
                                <TableCell align="right">{row.min}</TableCell>
                                <TableCell align="right">{row.max}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <FormHelperText>* Calculated at level 100 with either max IVs, EVs and a beneficial nature or min IVs, EVs and a hindering nature.</FormHelperText>
        </>
    );
}

export default Stats;
