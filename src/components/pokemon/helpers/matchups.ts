import {
    type PokemonTypeDetails,
    type PokemonTypeName,
    type PokemonTypeRelations,
    pokemonTypeNames,
} from "../../../model/PokemonTypeDetails";

export type MatchupMultiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4;
export type Matchups = Record<MatchupMultiplier, PokemonTypeName[]>;

export const coreOffensiveMultipliers: MatchupMultiplier[] = [2, 0.5, 0];
export const coreDefensiveMultipliers: MatchupMultiplier[] = [2, 0.5, 0];

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

export const buildOffensiveMatchups = (type: PokemonTypeDetails): Matchups => {
    const matchups = emptyMatchups();

    pokemonTypeNames.forEach((defendingType) => {
        const multiplier = getMultiplier(type.damage_relations, defendingType, 'to');
        matchups[multiplier].push(defendingType);
    });

    return matchups;
};

export const buildDefensiveMatchups = (types: PokemonTypeDetails[]): Matchups => {
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
