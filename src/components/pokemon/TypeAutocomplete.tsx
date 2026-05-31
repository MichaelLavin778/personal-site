import { Autocomplete, Box, Stack, TextField, Typography } from "@mui/material";
import type { Dispatch } from "react";
import { toTitleCase } from "../../helpers/common";
import { getTypeColors, getTypeSpriteUrl } from "../../helpers/pokemonType";
import { useAppSelector } from "../../hooks/hooks";
import { type PokemonTypeName, pokemonTypeNames } from "../../model/PokemonTypeDetails";
import { selectPokemonTypeFetchStateByName } from "../../state/pokemonTypesSlice";

type TypeAutocompleteProps = {
    clearable?: boolean;
    excludedType: string;
    id: string;
    label: string;
    onChange: Dispatch<string>;
    value: string;
}

const TypeAutocompleteRow = ({ typeName }: { typeName: PokemonTypeName }) => {
    const fetchState = useAppSelector(state => selectPokemonTypeFetchStateByName(state, typeName));
    const spriteUrl = fetchState.status === 'success' ? getTypeSpriteUrl(fetchState.type) : undefined;
    const { bgcolor, borderColor } = getTypeColors(typeName);

    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            aria-label={`${toTitleCase(typeName)} type`}
            sx={{
                width: '100%',
                minWidth: 0,
                px: 1,
                py: 0.5,
                bgcolor,
                border: 1,
                borderColor,
                borderRadius: 1,
                color: 'white',
                textShadow: "1px 1px 2px rgba(0, 0, 0, .7)",
            }}
        >
            {spriteUrl && (
                <Box
                    component="img"
                    src={spriteUrl}
                    alt=""
                    sx={{ width: 22, height: 22, flexShrink: 0 }}
                />
            )}
            <Typography variant="body2" sx={{ color: 'inherit', textTransform: 'uppercase' }}>
                {typeName}
            </Typography>
        </Stack>
    );
};

const TypeAutocomplete = ({
    clearable = false,
    excludedType,
    id,
    label,
    onChange,
    value,
}: TypeAutocompleteProps) => (
    <Autocomplete
        disableClearable={!clearable}
        fullWidth
        getOptionLabel={typeName => toTitleCase(typeName)}
        id={id}
        onChange={(_event, typeName) => onChange(typeName ?? '')}
        options={pokemonTypeNames.filter(type => type !== excludedType)}
        renderInput={params => (
            <TextField
                {...params}
                label={label}
                slotProps={{
                    input: {
                        ...params.InputProps,
                    },
                    htmlInput: {
                        ...params.inputProps,
                        'aria-label': label,
                        readOnly: true,
                    },
                }}
            />
        )}
        renderOption={(props, typeName) => (
            <Box component="li" {...props} key={props.key}>
                <TypeAutocompleteRow typeName={typeName} />
            </Box>
        )}
        renderValue={typeName => <TypeAutocompleteRow typeName={typeName} />}
        value={(value || null) as PokemonTypeName | null}
    />
);

export default TypeAutocomplete;
