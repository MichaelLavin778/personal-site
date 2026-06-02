import type { Pokemon } from "../model/Pokemon";
import type { PokemonItemSimple } from "../model/PokemonVariant";

export const getPokemonSpeciesForVariants = (
	variants: PokemonItemSimple[],
	pokemonSpecies: Pokemon[]
) => {
	const speciesByName = new Map(pokemonSpecies.map((species) => [species.name, species]));
	const speciesBySpecificity = [...pokemonSpecies].sort((a, b) => b.name.length - a.name.length);
	const includedSpeciesNames = new Set<string>();

	return variants.flatMap((variant) => {
		const species = speciesByName.get(variant.name) ??
			speciesBySpecificity.find((candidate) => variant.name.startsWith(`${candidate.name}-`));

		if (!species || includedSpeciesNames.has(species.name)) return [];

		includedSpeciesNames.add(species.name);
		return [species];
	});
};
