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
	abilities: PokemonAbility[] | undefined
	base_experience: number | undefined
	cries: PokemonCry | undefined
	forms: PokemonItemSimple[] | undefined
	// game_indices
	height: number | undefined
	// held_items
	id: number | undefined
	is_default: boolean | undefined
	location_area_encounters: string | undefined
	moves: PokemonMove[]
	order: number | undefined
	// past_abilities
	// past_types
	species: PokemonItemSimple | undefined
	sprites: PokemonSprites | undefined
	stats: PokemonStat[] | undefined
	types: PokemonType[] | undefined
	weight: number | undefined
}
