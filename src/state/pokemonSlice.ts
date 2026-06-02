import { type PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Pokemon } from '../model/Pokemon';
import type { PokemonGender, PokemonItemSimple, PokemonVariant } from '../model/PokemonVariant';
import type { RootState } from './store';

const initialState: Pokemon[] = [];
let isPokemonListRequestInFlight = false;
const pokemonRequestsInFlight = new Set<string>();
const pokemonVariantRequestsInFlight = new Set<string>();

// Async thunk to fetch pokemon list
export const loadPokemonList = createAsyncThunk<
	PokemonItemSimple[],
	void,
	{ rejectValue: string; state: RootState }
>('pokemon/pokemonList', async (_: void, thunkAPI) => {
	isPokemonListRequestInFlight = true;
	try {
		const apiUrl = 'https://pokeapi.co/api/v2/pokemon-species?limit=100000';
		const res = await fetch(apiUrl);
		if (!res.ok) throw Error(`Failed to fetch: ${res.status} ${res.statusText}`);

		const json = await res.json();
		const results: PokemonItemSimple[] = Array.isArray(json?.results)
			? json.results.map((p: Record<string, unknown>) => ({ name: String(p['name'] ?? ''), url: String(p['url'] ?? '') }))
			: [];

		return results;
	} catch (err: unknown) {
		const message = (err as Error)?.message ?? String(err);
		return thunkAPI.rejectWithValue(message);
	} finally {
		isPokemonListRequestInFlight = false;
	}
}, {
	condition: (_, { getState }) =>
		!isPokemonListRequestInFlight && getState().pokemon.pokemon.length === 0,
})

const getPokemonGender = (genderRate: number | undefined): PokemonGender => {
	if (genderRate === -1) return 'genderless';
	if (genderRate === 0) return 'male';
	if (genderRate === 8) return 'female';
	if (genderRate !== undefined) return 'both';
	return 'unknown';
};

type PokemonSpeciesResponse = Omit<Pokemon, 'gender' | 'url' | 'varieties'> & {
	varieties?: Array<{
		is_default?: boolean
		pokemon?: PokemonItemSimple
	}>
}

const readPokemonSpecies = (json: PokemonSpeciesResponse, apiUrl: string): Pokemon => {
	const gender = getPokemonGender(json.gender_rate);
	const varieties = (json.varieties ?? []).flatMap((variety) =>
		variety.pokemon
			? [{
				...variety.pokemon,
				is_default: variety.is_default,
				gender,
			} as PokemonVariant]
			: []
	);

	return {
		...json,
		url: apiUrl,
		varieties,
		gender,
	};
};

export const loadPokemon = createAsyncThunk<
	Pokemon,
	string,
	{ rejectValue: string; state: RootState }
>('pokemon/pokemon', async (apiUrl, thunkAPI) => {
	pokemonRequestsInFlight.add(apiUrl);
	try {
		const res = await fetch(apiUrl);
		if (!res.ok) throw Error(`Failed to fetch: ${res.status} ${res.statusText}`);

		return readPokemonSpecies(await res.json(), apiUrl);
	} catch (err: unknown) {
		const message = (err as Error)?.message ?? String(err);
		return thunkAPI.rejectWithValue(message);
	} finally {
		pokemonRequestsInFlight.delete(apiUrl);
	}
}, {
	condition: (apiUrl, { getState }) => {
		const cachedPokemon = getState().pokemon.pokemon.find((p) => p.url === apiUrl);
		return !pokemonRequestsInFlight.has(apiUrl) && !cachedPokemon?.id;
	},
})

export const loadPokemonVariant = createAsyncThunk<
	PokemonVariant,
	string,
	{ rejectValue: string; state: RootState }
>('pokemon/pokemonVariant', async (apiUrl, thunkAPI) => {
	pokemonVariantRequestsInFlight.add(apiUrl);
	try {
		const res = await fetch(apiUrl);
		if (!res.ok) throw Error(`Failed to fetch: ${res.status} ${res.statusText}`);

		return {
			...await res.json(),
			url: apiUrl,
		} as PokemonVariant;
	} catch (err: unknown) {
		const message = (err as Error)?.message ?? String(err);
		return thunkAPI.rejectWithValue(message);
	} finally {
		pokemonVariantRequestsInFlight.delete(apiUrl);
	}
}, {
	condition: (apiUrl, { getState }) => {
		const cachedVariant = getState().pokemon.pokemon
			.flatMap((pokemon) => pokemon.varieties ?? [])
			.find((variant) => variant.url === apiUrl);
		return !pokemonVariantRequestsInFlight.has(apiUrl) && !cachedVariant?.id;
	},
})

export const pokemonSlice = createSlice({
	name: 'pokemon',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(loadPokemonList.fulfilled, (state, action: PayloadAction<PokemonItemSimple[]>) => {
				const payload = action.payload;
				const existingPokemonNames = new Set(state.map((p) => p.name));
				for (const p of payload) {
					if (existingPokemonNames.has(p.name)) continue;
					state.push({
						...p,
						gender: undefined,
						varieties: undefined,
					} as Pokemon);
					existingPokemonNames.add(p.name);
				}
			})
			.addCase(loadPokemon.fulfilled, (state, action: PayloadAction<Pokemon>) => {
				const index = state.findIndex(p => p.name === action.payload.name);
				if (index >= 0) state[index] = { ...state[index], ...action.payload };
				else state.push(action.payload);
			})
			.addCase(loadPokemonVariant.fulfilled, (state, action: PayloadAction<PokemonVariant>) => {
				for (const pokemon of state) {
					const index = pokemon.varieties?.findIndex((variant) => variant.name === action.payload.name) ?? -1;
					if (index < 0 || !pokemon.varieties) continue;

					pokemon.varieties[index] = {
						...pokemon.varieties[index],
						...action.payload,
						gender: pokemon.gender,
					};
					return;
				}
			})
	},
})

// Selectors
export const getPokemonList = (state: RootState) => state.pokemon.pokemon
export const getPokemon = (state: RootState, pokemonName: string) =>
	getPokemonList(state).find((p) => p.name === pokemonName)
export const getDefaultPokemonVariant = (state: RootState, pokemonName: string) => {
	const varieties = getPokemon(state, pokemonName)?.varieties ?? [];
	return varieties.find((variant) => variant.is_default) ?? varieties[0];
}
export const getPokemonIndex = (state: RootState, pokemonName: string) =>
	getPokemonList(state).findIndex((p) => p.name === pokemonName)
export const getPreviousPokemon = (state: RootState, pokemonName: string) => {
	const pokemonList = getPokemonList(state);
	const index = getPokemonIndex(state, pokemonName);
	return index > 0 ? pokemonList[index - 1] : undefined;
}
export const getNextPokemon = (state: RootState, pokemonName: string) => {
	const pokemonList = getPokemonList(state);
	const index = getPokemonIndex(state, pokemonName);
	return (index >= 0 && index < getPokemonList(state).length - 1
		? pokemonList[index + 1]
		: undefined);
}

export default pokemonSlice.reducer
