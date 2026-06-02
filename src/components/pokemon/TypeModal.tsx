import CloseIcon from "@mui/icons-material/Close";
import {
    Box,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import type { PokemonType } from "../../model/PokemonVariant";
import {
    type PokemonTypeDetails,
    pokemonTypeNames,
} from "../../model/PokemonTypeDetails";
import {
    getPokemonTypeResource,
    loadPokemonTypeDetails,
    selectPokemonTypeFetchStateByName,
} from "../../state/pokemonTypesSlice";
import {
    type MatchupMultiplier,
    buildDefensiveMatchups,
    buildOffensiveMatchups,
    coreDefensiveMultipliers,
    coreOffensiveMultipliers,
} from "./helpers/matchups";
import TypeAutocomplete from "./TypeAutocomplete";
import TypeMatchupTable from "./TypeMatchupTable";

type TypeModalProps = {
    initialTypes: PokemonType[];
    onClose: () => void;
}

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
                Type Matchups
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
                                    <TypeMatchupTable
                                        key={type.name}
                                        kind="Offensive"
                                        matchups={matchups}
                                        multipliers={coreOffensiveMultipliers}
                                        typeName={type.name}
                                    />
                                ))}
                            </Box>
                            <TypeMatchupTable
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
