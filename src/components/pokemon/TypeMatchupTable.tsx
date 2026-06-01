import {
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import type { PokemonTypeName } from "../../model/PokemonTypeDetails";
import type { MatchupMultiplier, Matchups } from "./helpers/matchups";
import TypeBadge from "./TypeBadge";

const formatMultiplier = (multiplier: MatchupMultiplier) => {
    if (multiplier === 0.5) return '1/2';
    if (multiplier === 0.25) return '1/4';
    return String(multiplier);
};

const getMatchupLabel = (kind: 'Offensive' | 'Defensive', multiplier: MatchupMultiplier) => {
    if (kind === 'Offensive') {
        if (multiplier === 0) return 'No effect (x0)';
        return `${multiplier > 1 ? 'Super effective' : 'Not very effective'} (x${formatMultiplier(multiplier)})`;
    }

    if (multiplier === 0) return 'Immune (x0)';
    return `${multiplier > 1 ? 'Weak' : 'Resists'} (x${formatMultiplier(multiplier)})`;
};

const TypeMatchupTable = ({
    kind,
    matchups,
    multipliers,
    typeName,
}: {
    kind: 'Offensive' | 'Defensive';
    matchups: Matchups;
    multipliers: MatchupMultiplier[];
    typeName?: string;
}) => {
    const contextLabel = typeName ? `${typeName} ${kind.toLowerCase()}` : kind.toLowerCase();

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table
                size="small"
                aria-label={`${contextLabel} type matchups`}
                sx={{ display: { xs: 'block', sm: 'table' }, height: { sm: '100%' } }}
            >
            <TableHead sx={{ display: { xs: 'block', sm: 'table-header-group' } }}>
                <TableRow sx={{ display: { xs: 'block', sm: 'table-row' } }}>
                    <TableCell
                        colSpan={multipliers.length}
                        align="center"
                        sx={{ display: { xs: 'block', sm: 'table-cell' } }}
                    >
                        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                            <Typography component="h3" variant="subtitle2">{kind} properties</Typography>
                            {typeName && <TypeBadge typeName={typeName as PokemonTypeName} />}
                        </Stack>
                    </TableCell>
                </TableRow>
                <TableRow sx={{ display: { xs: 'none', sm: 'table-row' } }}>
                    {multipliers.map((multiplier, index) => (
                        <TableCell
                            key={multiplier}
                            align="center"
                            sx={{
                                minWidth: 132,
                                fontWeight: 700,
                                borderRightWidth: { sm: index < multipliers.length - 1 ? 1 : 0 },
                                borderRightStyle: 'solid',
                                borderRightColor: 'divider',
                            }}
                        >
                            {getMatchupLabel(kind, multiplier)}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody sx={{ display: { xs: 'block', sm: 'table-row-group' } }}>
                <TableRow sx={{ display: { xs: 'block', sm: 'table-row' } }}>
                    {multipliers.map((multiplier, index) => (
                        <TableCell
                            key={multiplier}
                            data-testid={`${kind.toLowerCase()}-x${String(multiplier).replace('.', '_')}`}
                            sx={{
                                display: { xs: 'block', sm: 'table-cell' },
                                width: { xs: '100%', sm: 'auto' },
                                verticalAlign: 'top',
                                borderRightWidth: { sm: index < multipliers.length - 1 ? 1 : 0 },
                                borderRightStyle: 'solid',
                                borderRightColor: 'divider',
                            }}
                        >
                            <Typography
                                component="h4"
                                variant="subtitle2"
                                align="center"
                                sx={{ display: { xs: 'block', sm: 'none' }, mb: 1 }}
                            >
                                {getMatchupLabel(kind, multiplier)}
                            </Typography>
                            <Stack spacing={0.5} alignItems="center">
                                {matchups[multiplier].length > 0
                                    ? matchups[multiplier].map(typeName => (
                                        <TypeBadge key={typeName} typeName={typeName} />
                                    ))
                                    : '-'}
                            </Stack>
                        </TableCell>
                    ))}
                </TableRow>
            </TableBody>
            </Table>
        </TableContainer>
    );
};

export default TypeMatchupTable;
