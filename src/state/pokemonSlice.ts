import { type PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Pokemon, PokemonGender, PokemonItemSimple } from '../model/Pokemon';
import type { RootState } from './store';

const initialState: Pokemon[] = [];

// Async thunk to fetch pokemon list
export const loadPokemonList = createAsyncThunk<
	PokemonItemSimple[]
>('pokemon/pokemonList', async (_, thunkAPI) => {
	try {
		const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=100000';
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
	}
})

const readGenderNames = async (apiUrl: string): Promise<string[]> => {
	const res = await fetch(apiUrl);
	if (!res.ok) throw Error(`Failed to fetch: ${res.status} ${res.statusText}`);

	const json = (await res.json()) as {
		pokemon_species_details?: Array<{
			pokemon_species?: { name?: string }
		}>
	};

	return (json.pokemon_species_details ?? [])
		.map((d) => d.pokemon_species?.name)
		.filter((n): n is string => typeof n === 'string' && n.length > 0)
		.map((n) => n.trim().toLowerCase());
};

export const loadPokemonGenderData = createAsyncThunk<
	{ male: string[]; female: string[] },
	void,
	{ rejectValue: string }
>('pokemon/genderData', async (_: void, thunkAPI) => {
	try {
		// PokeAPI: 1=female, 2=male, 3=genderless
		const [female, male] = await Promise.all([
			readGenderNames('https://pokeapi.co/api/v2/gender/1'),
			readGenderNames('https://pokeapi.co/api/v2/gender/2'),
		]);

		return {
			male: Array.from(new Set(male)),
			female: Array.from(new Set(female)),
		};
	} catch (err: unknown) {
		const message = (err as Error)?.message ?? String(err);
		return thunkAPI.rejectWithValue(message);
	}
});

// Backwards-compatible export name: this no longer loads "genderless" specifically.
// It loads male+female gender lists and merges derived gender data into pokemon state.
export const loadGenderlessPokemonList = loadPokemonGenderData;

export const loadPokemon = createAsyncThunk<
	Pokemon,
	string,
	{ rejectValue: string }
>('pokemon/pokemon', async (apiUrl, thunkAPI) => {
	try {
		const res = await fetch(apiUrl);
		if (!res.ok) throw Error(`Failed to fetch: ${res.status} ${res.statusText}`);

		const json = await res.json();
		const results: Pokemon = json;

		return results;
	} catch (err: unknown) {
		const message = (err as Error)?.message ?? String(err);
		return thunkAPI.rejectWithValue(message);
	}
})

export const pokemonSlice = createSlice({
	name: 'pokemon',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(loadPokemonList.fulfilled, (state, action: PayloadAction<PokemonItemSimple[]>) => {
				const payload = action.payload;
				for (const p of payload) {
					state.push({
						...p,
						gender: undefined,
					} as Pokemon);
				}
			})
			.addCase(loadPokemonGenderData.fulfilled, (state, action: PayloadAction<{
				male: string[];
				female: string[];
			}>) => {
				const maleSet = new Set(action.payload.male);
				const femaleSet = new Set(action.payload.female);

				for (const p of state) {
					const isMale = maleSet.has(p.name);
					const isFemale = femaleSet.has(p.name);

					let gender: PokemonGender = 'unknown';
					if (isMale && isFemale) gender = 'both';
					else if (isMale) gender = 'male';
					else if (isFemale) gender = 'female';
					else gender = 'genderless';

					p.gender = gender;
				}
			})
			.addCase(loadPokemon.fulfilled, (state, action: PayloadAction<Pokemon>) => {
				const index = state.findIndex(p => p.name === action.payload.name);
				state[index] = { ...state[index], ...action.payload };
			})
	},
})

// Selectors
export const getPokemonList = (state: RootState) => state.pokemon.pokemon
export const getPokemon = (state: RootState, pokemonName: string) =>
	getPokemonList(state).find((p) => p.name === pokemonName)
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
