import {
    Box,
    Link,
    Typography,
} from "@mui/material";
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { toTitleCase } from "../../helpers/common";
import type { Pokemon, PokemonAbility } from "../../model/Pokemon";
import AbilityModal from "./AbilityModal";

interface AbilitiesProps {
    pokemon: Pokemon;
}

const Abilities = ({ pokemon }: AbilitiesProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const abilities = pokemon.abilities;
    const displayedAbilities: PokemonAbility[] = useMemo(() => {
        if (!abilities || abilities.length === 0) return [];

        const abilityLabels = abilities.map((ability) => {
            if (ability.ability.name === 'soul-heart')
                return { ...ability, ability: { ...ability.ability, name: 'Soul-Heart' } };
            if (ability.ability.name === 'well-baked-body')
                return { ...ability, ability: { ...ability.ability, name: 'Well-Baked Body' } };
            return { ...ability, ability: { ...ability.ability, name: toTitleCase(ability.ability.name.replaceAll('-', ' ')) } };
        });

        const nonHidden = abilityLabels.filter(a => !a.is_hidden);
        const hidden = abilityLabels.find(a => a.is_hidden);
        return hidden ? [...nonHidden, hidden] : nonHidden;
    }, [abilities]);

    const selectedAbilityParam = useMemo(
        () => new URLSearchParams(location.search).get('ability'),
        [location.search]
    );
    const getAbilityParamValue = useCallback((ability: PokemonAbility) => {
        const fromUrl = ability.ability.url.split('/').filter(Boolean).at(-1);
        return fromUrl ?? ability.ability.name.trim().toLowerCase().replaceAll(' ', '-');
    }, []);
    const selectedAbility = useMemo(
        () => displayedAbilities.find(
            (ability) => getAbilityParamValue(ability) === selectedAbilityParam
        ) ?? null,
        [displayedAbilities, getAbilityParamValue, selectedAbilityParam]
    );

    const setAbilityUrlParam = useCallback((ability: PokemonAbility | null) => {
        const params = new URLSearchParams(window.location.search || location.search);

        if (ability) {
            params.set('ability', getAbilityParamValue(ability));
            params.delete('move');
        } else
            params.delete('ability');

        const nextSearch = params.toString();
        navigate(
            {
                pathname: location.pathname,
                search: nextSearch ? `?${nextSearch}` : '',
                hash: window.location.hash || location.hash,
            },
            { replace: true }
        );
    }, [getAbilityParamValue, location.hash, location.pathname, location.search, navigate]);

    const setAbility = useCallback((ability: PokemonAbility | null = null) => {
        setAbilityUrlParam(ability);
    }, [setAbilityUrlParam]);

    const renderAbilities = () => {
        const hiddenAbility = displayedAbilities.find(a => a.is_hidden);
        const nonHiddenAbilities = displayedAbilities.filter(a => !a.is_hidden);

        return (
            <>
                {nonHiddenAbilities.map(ability => (
                    <Link
                        key={`${ability.ability.name}-${ability.slot}`}
                        onClick={() => setAbility(ability)}
                        component="span"
                        variant="body1"
                        sx={{
                            display: 'block',
                            width: 'fit-content',
                            color: 'textPrimary',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                        aria-label={`Open ability info for ${ability.ability.name}`}
                    >
                        <Typography component="span" color="textPrimary">
                            {ability.ability.name}
                        </Typography>
                    </Link>
                ))}
                {!!hiddenAbility && (
                    <Link
                        key={`${hiddenAbility.ability.name}-${hiddenAbility.slot}`}
                        onClick={() => setAbility(hiddenAbility)}
                        component="span"
                        variant="body2"
                        sx={{
                            display: 'block',
                            width: 'fit-content',
                            color: 'textPrimary',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                        aria-label={`Open ability info for ${hiddenAbility.ability.name} (hidden)`}
                    >
                        <Typography component="span" variant="body2" color="textPrimary">
                            {hiddenAbility.ability.name} (hidden)
                        </Typography>
                    </Link>
                )}
            </>
        );
    };

    return (
        <>
            <Box>
                <Typography component="span" variant="caption" color="textSecondary">Abilities</Typography>
            </Box>
            {displayedAbilities.length > 0 ? renderAbilities() : '-'}
            <AbilityModal
                displayedAbilities={displayedAbilities}
                pokemon={pokemon}
                selectedAbility={selectedAbility}
                setAbility={setAbility}
            />
        </>
    );
};

export default Abilities;
