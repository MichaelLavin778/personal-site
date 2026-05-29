import {
    Box,
    Link,
    Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

    const hasAppliedInitialAbilityParamRef = useRef(false);
    const initialAbilityParamRef = useRef(new URLSearchParams(location.search).get('ability'));
    const getAbilityParamValue = useCallback((ability: PokemonAbility) => {
        const fromUrl = ability.ability.url.split('/').filter(Boolean).at(-1);
        return fromUrl ?? ability.ability.name.trim().toLowerCase().replaceAll(' ', '-');
    }, []);
    const initialAbility = displayedAbilities.find(
        (ability) => getAbilityParamValue(ability) === initialAbilityParamRef.current
    ) || null;
    const [selectedAbility, setSelectedAbility] = useState<PokemonAbility | null>(initialAbility);

    useEffect(() => {
        if (hasAppliedInitialAbilityParamRef.current) return;

        const initialAbilityParam = initialAbilityParamRef.current;
        if (!initialAbilityParam) {
            hasAppliedInitialAbilityParamRef.current = true;
            return;
        }

        const abilityFromUrl = displayedAbilities.find(
            (ability) => getAbilityParamValue(ability) === initialAbilityParam
        );
        if (!abilityFromUrl) return;

        setSelectedAbility(abilityFromUrl);
        hasAppliedInitialAbilityParamRef.current = true;
    }, [displayedAbilities, getAbilityParamValue]);

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

    const setAbility = (ability: PokemonAbility | null = null) => {
        setSelectedAbility(ability);
        setAbilityUrlParam(ability);
    }

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
                <Typography component="label" variant="caption" color="textSecondary">Abilities</Typography>
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
