import type { PokemonItemSimple } from "./Pokemon"

export type PokemonItemWeak = {
    name?: string
    url?: string
}

export type EffectEntry = {
    effect: string
    language: PokemonItemSimple
    short_effect: string
}

export type FlavorTextEntry = {
    flavor_text: string
    language: PokemonItemSimple
    version_group: PokemonItemSimple
}

export type Machine = {
    machine: PokemonItemWeak
    version_group: PokemonItemSimple
}

export type Meta = {
    ailment: PokemonItemSimple
    ailment_chance: number
    category: PokemonItemSimple
    crit_rate: number
    drain: number
    flinch_chance: number
    healing: number
    max_hits: number | undefined
    max_turns: number| undefined
    min_hits: number | undefined
    min_turns: number | undefined
    stat_chance: number
}

export type StatChange = {
    change: number
    stat: PokemonItemSimple
}

export type PokemonMove = {
    accuracy: number | undefined
    // contest_combos 
    // contest_effect
    // contest_type
    damage_class: PokemonItemSimple
    effect_chance: number | undefined
    // effect_changes: []
    effect_entries: EffectEntry[]
    flavor_text_entries: FlavorTextEntry[]
    generation: PokemonItemSimple
    id: number
    learned_by_pokemon: PokemonItemSimple[]
    machines: Machine[]
    meta: Meta
    name: string
    // names
    // past_values
    power: number | undefined
    pp: number
    priority: number
    stat_changes: StatChange[]
    // super_contest_effect
    target: PokemonItemSimple
    type: PokemonItemSimple
}