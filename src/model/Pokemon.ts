export type PokemonItemSimple = {
	name: string
	url: string
}

export type PokemonAbility = {
	ability: PokemonItemSimple
	is_hidden: boolean
	slot: number
}

export type PokemonCry = {
	latest: string | null
	legacy: string | null
}

export type PokemonMove = {
	move: PokemonItemSimple
}

export type PokemonSprites = {
	back_default: string | null
	back_female: string | null
	back_shiny: string | null
	back_shiny_female: string | null
	front_default: string | null
	front_female: string | null
	front_shiny: string | null
	front_shiny_female: string | null
	// other
	// versions
}

export type PokemonStat = {
	base_stat: number
	effort: number
	stat: PokemonItemSimple
}

export type PokemonType = {
	slot: number
	type: PokemonItemSimple
}

export type Pokemon = PokemonItemSimple & {
	abilities: PokemonAbility[]
	base_experience: number
	cries: PokemonCry
	forms: PokemonItemSimple[]
	// game_indices
	height: number
	// held_items
	id: number
	is_default: boolean
	location_area_encounters: string
	moves: PokemonMove[]
	order: number
	// past_abilities
	// past_types
	species: PokemonItemSimple
	sprites: PokemonSprites
	stats: PokemonStat[]
	types: PokemonType[]
	weight: number
}
