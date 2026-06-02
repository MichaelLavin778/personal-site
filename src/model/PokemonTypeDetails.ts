import type { PokemonItemSimple } from "./PokemonVariant";

export const pokemonTypeNames = [
    'normal',
    'fire',
    'water',
    'electric',
    'grass',
    'ice',
    'fighting',
    'poison',
    'ground',
    'flying',
    'psychic',
    'bug',
    'rock',
    'ghost',
    'dragon',
    'dark',
    'steel',
    'fairy',
] as const;

export type PokemonTypeName = typeof pokemonTypeNames[number];

export type PokemonTypeRelations = {
    no_damage_to: PokemonItemSimple[];
    half_damage_to: PokemonItemSimple[];
    double_damage_to: PokemonItemSimple[];
    no_damage_from: PokemonItemSimple[];
    half_damage_from: PokemonItemSimple[];
    double_damage_from: PokemonItemSimple[];
}

type PokemonTypeSprite = {
    name_icon: string | null;
    symbol_icon: string | null;
}

export type PokemonTypeDetails = {
    name: string;
    damage_relations: PokemonTypeRelations;
    sprites?: Record<string, Record<string, PokemonTypeSprite>>;
}
