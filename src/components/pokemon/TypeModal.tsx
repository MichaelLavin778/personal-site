import CloseIcon from "@mui/icons-material/Close";
import {
    Box,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
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
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import type { PokemonType } from "../../model/Pokemon";
import {
    type PokemonTypeDetails,
    type PokemonTypeName,
    type PokemonTypeRelations,
    pokemonTypeNames,
} from "../../model/PokemonTypeDetails";
import {
    getPokemonTypeResource,
    loadPokemonTypeDetails,
    selectPokemonTypeFetchStateByName,
} from "../../state/pokemonTypesSlice";
import TypeAutocomplete from "./TypeAutocomplete";
import TypeBadge from "./TypeBadge";

type TypeModalProps = {
    initialTypes: PokemonType[];
    onClose: () => void;
}

type MatchupMultiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4;
type Matchups = Record<MatchupMultiplier, PokemonTypeName[]>;

const coreOffensiveMultipliers: MatchupMultiplier[] = [2, 0.5, 0];
const coreDefensiveMultipliers: MatchupMultiplier[] = [2, 0.5, 0];

const emptyMatchups = (): Matchups => ({
    0: [],
    0.25: [],
    0.5: [],
    1: [],
    2: [],
    4: [],
});

const getMultiplier = (
    relations: PokemonTypeRelations,
    otherType: string,
    direction: 'to' | 'from'
): MatchupMultiplier => {
    if (relations[`no_damage_${direction}`].some(type => type.name === otherType)) return 0;
    if (relations[`half_damage_${direction}`].some(type => type.name === otherType)) return 0.5;
    if (relations[`double_damage_${direction}`].some(type => type.name === otherType)) return 2;
    return 1;
};

const buildOffensiveMatchups = (type: PokemonTypeDetails): Matchups => {
    const matchups = emptyMatchups();

    pokemonTypeNames.forEach((defendingType) => {
        const multiplier = getMultiplier(type.damage_relations, defendingType, 'to');
        matchups[multiplier].push(defendingType);
    });

    return matchups;
};

const buildDefensiveMatchups = (types: PokemonTypeDetails[]): Matchups => {
    const matchups = emptyMatchups();

    pokemonTypeNames.forEach((attackingType) => {
        const multiplier = types.reduce<number>(
            (total, type) => total * getMultiplier(type.damage_relations, attackingType, 'from'),
            1
        ) as MatchupMultiplier;
        matchups[multiplier].push(attackingType);
    });

    return matchups;
};

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

const MatchupTable = ({
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
            <Table size="small" aria-label={`${contextLabel} type matchups`}>
            <TableHead>
                <TableRow>
                    <TableCell colSpan={multipliers.length} align="center">
                        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                            <Typography component="h3" variant="subtitle2">{kind} properties</Typography>
                            {typeName && <TypeBadge typeName={typeName as PokemonTypeName} />}
                        </Stack>
                    </TableCell>
                </TableRow>
                <TableRow>
                    {multipliers.map((multiplier, index) => (
                        <TableCell
                            key={multiplier}
                            align="center"
                            sx={{
                                minWidth: 132,
                                fontWeight: 700,
                                borderRight: index < multipliers.length - 1 ? 1 : 0,
                                borderRightColor: 'divider',
                            }}
                        >
                            {getMatchupLabel(kind, multiplier)}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    {multipliers.map((multiplier, index) => (
                        <TableCell
                            key={multiplier}
                            data-testid={`${kind.toLowerCase()}-x${String(multiplier).replace('.', '_')}`}
                            sx={{
                                verticalAlign: 'top',
                                borderRight: index < multipliers.length - 1 ? 1 : 0,
                                borderRightColor: 'divider',
                            }}
                        >
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

const getRelatedTypeResources = (type: PokemonTypeDetails) => {
    const relationGroups = Object.values(type.damage_relations);
    const resources = relationGroups.flat();
    return [...new Map(resources.map(resource => [resource.name, resource])).values()];
};

const TypeModal = ({ initialTypes, onClose }: TypeModalProps) => {
    const dispatch = useAppDispatch();
    const initialResources = useMemo(
        () => new Map(initialTypes.map(type => [type.type.name, type.type])),
        [initialTypes]
    );
    const [primaryTypeName, setPrimaryTypeName] = useState(initialTypes[0]?.type.name ?? 'normal');
    const [secondaryTypeName, setSecondaryTypeName] = useState(initialTypes[1]?.type.name ?? '');

    const primaryFetchState = useAppSelector(state =>
        selectPokemonTypeFetchStateByName(state, primaryTypeName)
    );
    const secondaryFetchState = useAppSelector(state =>
        selectPokemonTypeFetchStateByName(state, secondaryTypeName)
    );

    const selectedResources = useMemo(() => {
        const names = [primaryTypeName, secondaryTypeName].filter(Boolean);
        return names.map(name => initialResources.get(name) ?? getPokemonTypeResource(name));
    }, [initialResources, primaryTypeName, secondaryTypeName]);

    useEffect(() => {
        selectedResources.forEach(resource => dispatch(loadPokemonTypeDetails(resource)));
    }, [dispatch, selectedResources]);

    useEffect(() => {
        pokemonTypeNames.forEach(name => dispatch(loadPokemonTypeDetails(getPokemonTypeResource(name))));
    }, [dispatch]);

    const selectedTypes = useMemo(() => {
        const states = secondaryTypeName
            ? [primaryFetchState, secondaryFetchState]
            : [primaryFetchState];
        return states.flatMap(state => state.status === 'success' ? [state.type] : []);
    }, [primaryFetchState, secondaryFetchState, secondaryTypeName]);

    useEffect(() => {
        selectedTypes
            .flatMap(getRelatedTypeResources)
            .forEach(resource => dispatch(loadPokemonTypeDetails(resource)));
    }, [dispatch, selectedTypes]);

    const selectedFetchStates = secondaryTypeName
        ? [primaryFetchState, secondaryFetchState]
        : [primaryFetchState];
    const loading = selectedFetchStates.some(state => state.status === 'idle' || state.status === 'loading');
    const errorMessages = [primaryFetchState, secondaryFetchState]
        .flatMap(state => state.status === 'error' ? [state.message] : []);
    const offensiveMatchups = useMemo(
        () => selectedTypes.map(type => ({ type, matchups: buildOffensiveMatchups(type) })),
        [selectedTypes]
    );
    const defensiveMatchups = useMemo(() => buildDefensiveMatchups(selectedTypes), [selectedTypes]);
    const defensiveMultipliers = useMemo(() => [
        ...(defensiveMatchups[4].length > 0 ? [4 as MatchupMultiplier] : []),
        ...coreDefensiveMultipliers,
        ...(defensiveMatchups[0.25].length > 0 ? [0.25 as MatchupMultiplier] : []),
    ], [defensiveMatchups]);

    const updatePrimaryType = (name: string) => {
        setPrimaryTypeName(name);
        if (name === secondaryTypeName) setSecondaryTypeName('');
    };
    const updateSecondaryType = (name: string) => {
        setSecondaryTypeName(name === primaryTypeName ? '' : name);
    };

    return (
        <Dialog open onClose={onClose} aria-labelledby="type-info-title" fullWidth maxWidth="lg">
            <DialogTitle id="type-info-title">
                Type matchups
                <IconButton
                    aria-label="close type matchup info"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pb: 1 }}>
                        <TypeAutocomplete
                            id="primary-type-select"
                            label="Primary type"
                            value={primaryTypeName}
                            excludedType={secondaryTypeName}
                            onChange={updatePrimaryType}
                        />
                        <TypeAutocomplete
                            id="secondary-type-select"
                            label="Secondary type"
                            value={secondaryTypeName}
                            excludedType={primaryTypeName}
                            onChange={updateSecondaryType}
                            clearable={true}
                        />
                    </Stack>

                    {loading && (
                        <Stack direction="row" justifyContent="center">
                            <CircularProgress size={20} />
                        </Stack>
                    )}

                    {errorMessages.map(message => (
                        <Typography key={message} color="error">{message}</Typography>
                    ))}

                    {!loading && errorMessages.length === 0 && (
                        <Stack spacing={2}>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                                    gap: 2,
                                }}
                            >
                                {offensiveMatchups.map(({ type, matchups }) => (
                                    <MatchupTable
                                        key={type.name}
                                        kind="Offensive"
                                        matchups={matchups}
                                        multipliers={coreOffensiveMultipliers}
                                        typeName={type.name}
                                    />
                                ))}
                            </Box>
                            <MatchupTable
                                kind="Defensive"
                                matchups={defensiveMatchups}
                                multipliers={defensiveMultipliers}
                            />
                        </Stack>
                    )}

                    <Typography variant="body2" color="textSecondary">
                        *Offense is shown separately for each selected type.
                        Defense combines incoming damage multipliers.
                    </Typography>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default TypeModal;
