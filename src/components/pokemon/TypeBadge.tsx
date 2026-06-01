import { Box, Stack } from "@mui/material";
import { toTitleCase } from "../../helpers/common";
import { getTypeSpriteUrl } from "../../helpers/pokemonType";
import { useAppSelector } from "../../hooks/hooks";
import type { PokemonTypeName } from "../../model/PokemonTypeDetails";
import { selectPokemonTypeFetchStateByName } from "../../state/pokemonTypesSlice";
import Type from "./Type";

type TypeBadgeProps = {
    typeName: PokemonTypeName;
}

const TypeBadge = ({ typeName }: TypeBadgeProps) => {
    const fetchState = useAppSelector(state => selectPokemonTypeFetchStateByName(state, typeName));
    const spriteUrl = fetchState.status === 'success' ? getTypeSpriteUrl(fetchState.type) : undefined;

    return (
        <Stack
            direction="row"
            alignItems="center"
            aria-label={`${toTitleCase(typeName)} type`}
            sx={{ minWidth: 92 }}
        >
            {spriteUrl && (
                <Box
                    component="img"
                    src={spriteUrl}
                    alt=""
                    sx={{ width: 24, height: 24, mr: -0.5, zIndex: 1 }}
                />
            )}
            <Type
                typeName={typeName}
                sx={{
                    width: 80,
                    maxWidth: 'none',
                    pl: spriteUrl ? 0.75 : 0,
                    textShadow: "1px 1px 2px rgba(0, 0, 0, .7)",
                }}
            />
        </Stack>
    );
};

export default TypeBadge;
