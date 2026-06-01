import { Autocomplete, Box, TextField } from "@mui/material";
import type { Dispatch } from "react";
import { toTitleCase } from "../../helpers/common";
import { type PokemonTypeName, pokemonTypeNames } from "../../model/PokemonTypeDetails";
import TypeAutocompleteRow from "./TypeAutocompleteRow";
import TypeBadge from "./TypeBadge";

type TypeAutocompleteProps = {
    clearable?: boolean;
    excludedType: string;
    id: string;
    label: string;
    onChange: Dispatch<string>;
    value: string;
}

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
        sx={{
            '& .MuiAutocomplete-input': {
                cursor: 'pointer',
            },
            '& .MuiAutocomplete-endAdornment': {
                zIndex: 1,
            },
            '& .MuiAutocomplete-clearIndicator': {
                visibility: { xs: 'visible', sm: 'hidden' },
            },
            '&:hover .MuiAutocomplete-clearIndicator': {
                visibility: 'visible',
            },
        }}
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
        renderValue={typeName => <TypeBadge typeName={typeName} />}
        value={(value || null) as PokemonTypeName | null}
    />
);

export default TypeAutocomplete;
