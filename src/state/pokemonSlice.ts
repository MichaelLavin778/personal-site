import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { Pokemon, PokemonItemSimple } from '../model/Pokemon'

// Define item and slice state types
interface PokemonState {
	list: Pokemon[]
}

const initialState: PokemonState = {
	list: []
}

// Async thunk to fetch pokemon list
export const loadPokemonList = createAsyncThunk<
	PokemonItemSimple[]
>('pokemon/pokemonList', async (_, thunkAPI) => {
	try {
		const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=100000';
		const res = await fetch(apiUrl);
		if (!res.ok) {
			const message = `Failed to fetch: ${res.status} ${res.statusText}`;
			return thunkAPI.rejectWithValue(message);
		}
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

export const loadAllPokemon = createAsyncThunk<
	Pokemon[],
	string[],
	{ rejectValue: string }
>('pokemon/pokemonAll', async (names, thunkAPI) => {
	try {
		const promises: Promise<Response>[] = [];
		names.forEach((name) => promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)));
		const responses = await Promise.all(promises);
		const invalidResponse = responses.find((res) => !res.ok);
		if (invalidResponse) {
			const message = `Failed to fetch: ${invalidResponse.status} ${invalidResponse.statusText}`;
			return thunkAPI.rejectWithValue(message);
		}
		const results: Pokemon[] = [];
		for (const res of responses) {
			const json = await res.json();
			results.push(json.results as Pokemon);
		}

		return results;
	} catch (err: unknown) {
		const message = (err as Error)?.message ?? String(err);
		return thunkAPI.rejectWithValue(message);
	}
})

export const loadPokemon = createAsyncThunk<
	Pokemon,
	string,
	{ rejectValue: string }
>('pokemon/pokemon', async (apiUrl, thunkAPI) => {
	try {
		const res = await fetch(apiUrl);
		if (!res.ok) {
			const message = `Failed to fetch: ${res.status} ${res.statusText}`;
			return thunkAPI.rejectWithValue(message);
		}
		const json = await res.json();
		const results: Pokemon = json;

		return results;
	} catch (err: unknown) {
		const message = (err as Error)?.message ?? String(err);
		return thunkAPI.rejectWithValue(message);
	}
})

export const pokemonListSlice = createSlice({
	name: 'pokemon',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(loadPokemonList.fulfilled, (state, action: PayloadAction<PokemonItemSimple[]>) => {
				state.list = action.payload as Pokemon[]
			})
			.addCase(loadAllPokemon.fulfilled, (state, action: PayloadAction<Pokemon[]>) => {
				state.list = state.list.map((p, i) => { return { ...p, ...action.payload[i] } });
			})
			.addCase(loadPokemon.fulfilled, (state, action: PayloadAction<Pokemon>) => {
				const index = state.list.findIndex(p => p.name === action.payload.name);
				state.list[index] = { ...state.list[index], ...action.payload };
			})
	},
})

// Other code such as selectors can use the imported `RootState` type
export const selectPokemonList = (state: RootState) => state.pokemon.list

export default pokemonListSlice.reducer