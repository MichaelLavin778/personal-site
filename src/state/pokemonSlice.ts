import { createSlice, createAsyncThunk, createAction, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'
import type { Pokemon, PokemonItemSimple } from '../model/Pokemon'

const initialState: Pokemon[] = [];

type Payload = {
	index: number;
	pokemon: Pokemon
}
// Batched partial updates (apply many partial updates in a single dispatch)
const updatePokemonBatch = createAction<Payload[]>('pokemon/partialUpdateBatch')

// Async thunk to fetch pokemon list
export const loadPokemonList = createAsyncThunk<
	PokemonItemSimple[]
>('pokemon/pokemonList', async (_, thunkAPI) => {
	try {
		const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=100000';
		const res = await fetch(apiUrl);
		if (!res.ok) {
			throw Error(`Failed to fetch: ${res.status} ${res.statusText}`);
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

export const loadPokemon = createAsyncThunk<
	Pokemon,
	string,
	{ rejectValue: string }
>('pokemon/pokemon', async (apiUrl, thunkAPI) => {
	try {
		const res = await fetch(apiUrl);
		if (!res.ok) {
			throw Error(`Failed to fetch: ${res.status} ${res.statusText}`);
		}
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
				const payload = action.payload as Pokemon[];
				for (const p of payload) {
					state.push(p)
				}
			})
			.addCase(updatePokemonBatch, (state, action: PayloadAction<Payload[]>) => {
				// Apply many partial updates in a single pass. This reduces the number of
				// times React will re-render because only one dispatch happens per batch.
				for (const { index, pokemon } of action.payload) {
					if (index >= 0 && index < state.length) {
						state[index] = { ...state[index], ...pokemon }
					} else if (index === state.length) {
						state.push(pokemon)
					} else {
						while (state.length < index) {
							state.push({ name: '', id: 0 } as unknown as Pokemon)
						}
						state[index] = pokemon
					}
				}
			})
			.addCase(loadPokemon.fulfilled, (state, action: PayloadAction<Pokemon>) => {
				const index = state.findIndex(p => p.name === action.payload.name);
				state[index] = { ...state[index], ...action.payload };
			})
	},
})

// Other code such as selectors can use the imported `RootState` type
export const selectPokemon = (state: RootState) => state.pokemon.pokemon

export default pokemonSlice.reducer