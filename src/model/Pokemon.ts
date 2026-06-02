import type { PokemonGender, PokemonItemSimple, PokemonVariant } from "./PokemonVariant";

export type PokemonSpeciesDescription = {
	description: string
	language: PokemonItemSimple
}

export type PokemonSpeciesFlavorText = {
	flavor_text: string
	language: PokemonItemSimple
	version: PokemonItemSimple
}

export type PokemonSpeciesGenus = {
	genus: string
	language: PokemonItemSimple
}

export type PokemonSpeciesName = {
	language: PokemonItemSimple
	name: string
}

export type PokemonSpeciesPalParkEncounter = {
	area: PokemonItemSimple
	base_score: number
	rate: number
}

export type PokemonSpeciesPokedexNumber = {
	entry_number: number
	pokedex: PokemonItemSimple
}

export type Pokemon = PokemonItemSimple & {
	base_happiness: number | undefined
	capture_rate: number | undefined
	color: PokemonItemSimple | undefined
	egg_groups: PokemonItemSimple[] | undefined
	evolution_chain: { url: string } | undefined
	evolves_from_species: PokemonItemSimple | null | undefined
	flavor_text_entries: PokemonSpeciesFlavorText[] | undefined
	form_descriptions: PokemonSpeciesDescription[] | undefined
	forms_switchable: boolean | undefined
	gender_rate: number | undefined
	genera: PokemonSpeciesGenus[] | undefined
	generation: PokemonItemSimple | undefined
	growth_rate: PokemonItemSimple | undefined
	habitat: PokemonItemSimple | null | undefined
	has_gender_differences: boolean | undefined
	hatch_counter: number | undefined
	id: number | undefined
	is_baby: boolean | undefined
	is_legendary: boolean | undefined
	is_mythical: boolean | undefined
	names: PokemonSpeciesName[] | undefined
	order: number | undefined
	pal_park_encounters: PokemonSpeciesPalParkEncounter[] | undefined
	pokedex_numbers: PokemonSpeciesPokedexNumber[] | undefined
	shape: PokemonItemSimple | null | undefined
	varieties: PokemonVariant[] | undefined
	// Derived from gender_rate after the species details load.
	gender: PokemonGender | undefined
}
