import { Box, Typography } from "@mui/material";
import { toTitleCase } from "../../helpers/text";
import type { PokemonAbility } from "../../model/Pokemon";

interface AbilitiesProps {
    abilities: PokemonAbility[] | undefined;
}

const Abilities = ({ abilities }: AbilitiesProps) => {
    const renderAbilities = (abilities: PokemonAbility[]) => {
        const abilityLabels = abilities.map((ability) => {
            if (ability.ability.name === 'soul-heart') 
                return { ...ability, ability: { name: 'Soul-Heart' } };
            if (ability.ability.name === 'well-baked-body') 
                return { ...ability, ability: { name: 'Well-Baked Body' } };
            return { ...ability, ability: { name: toTitleCase(ability.ability.name.replaceAll('-', ' ')) } };
        });
        let hiddenAbility;
        if (abilityLabels.some(ability => ability.is_hidden)) 
            hiddenAbility = abilityLabels.find(ability => ability.is_hidden);
        return (
            <>
                {abilityLabels.filter(ability => !ability.is_hidden).map(ability => <Typography key={ability.ability.name}>{ability.ability.name}</Typography>)}
                {!!hiddenAbility && (
                    <Typography key={hiddenAbility.ability.name} variant="body2">{`${hiddenAbility.ability.name} (hidden)`}</Typography>
                )}
            </>
        );
    };

    return (
        <>
            <Box>
                <Typography component="label" variant="caption" color="textSecondary">Abilities</Typography>
            </Box>
            {abilities && abilities.length > 0 ? renderAbilities(abilities) : '-'}
        </>
    );
};

export default Abilities;