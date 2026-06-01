import { Box, Stack, Typography } from "@mui/material";
import { toTitleCase } from "../../helpers/common";
import { getTypeColors, getTypeSpriteUrl } from "../../helpers/pokemonType";
import { useAppSelector } from "../../hooks/hooks";
import type { PokemonTypeName } from "../../model/PokemonTypeDetails";
import { selectPokemonTypeFetchStateByName } from "../../state/pokemonTypesSlice";

type TypeAutocompleteRowProps = {
    typeName: PokemonTypeName;
}

const TypeAutocompleteRow = ({ typeName }: TypeAutocompleteRowProps) => {
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

export default TypeAutocompleteRow;
