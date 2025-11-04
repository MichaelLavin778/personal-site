import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Define item and slice state types
export type PokemonItemSimple = {
	name: string
	url: string
}

interface PokemonState {
	list: PokemonItemSimple[]
	loaded: boolean
	error: string | null
}

const initialState: PokemonState = {
	list: [],
	loaded: false,
	error: null,
}

// Async thunk to fetch pokemon list
export const loadPokemonList = createAsyncThunk<
	PokemonItemSimple[],
	string | undefined,
	{ rejectValue: string }
>('pokemon/loadPokemonList', async (apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=100000', thunkAPI) => {
	try {
		const res = await fetch(apiUrl)
		if (!res.ok) {
			const message = `Failed to fetch: ${res.status} ${res.statusText}`
			return thunkAPI.rejectWithValue(message)
		}
		const json = await res.json()
		const results: PokemonItemSimple[] = Array.isArray(json?.results)
			? json.results.map((p: Record<string, unknown>) => ({ name: String(p['name'] ?? ''), url: String(p['url'] ?? '') }))
			: []

		return results
	} catch (err: unknown) {
		const message = (err as Error)?.message ?? String(err)
		return thunkAPI.rejectWithValue(message)
	}
})

export const pokemonSlice = createSlice({
	name: 'pokemon',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(loadPokemonList.pending, (state) => {
				state.loaded = false
				state.error = null
			})
			.addCase(loadPokemonList.fulfilled, (state, action: PayloadAction<PokemonItemSimple[]>) => {
				state.list = action.payload
				state.loaded = true
				state.error = null
			})
			.addCase(loadPokemonList.rejected, (state, action) => {
				// rejectWithValue returns our string message as action.payload when used
				const payload = action.payload as string | undefined
				state.error = payload ?? action.error.message ?? 'Unknown error'
				state.loaded = false
			})
	},
})

// Other code such as selectors can use the imported `RootState` type
export const selectPokemonList = (state: RootState) => state.pokemon.list
export const selectPokemonLoaded = (state: RootState) => state.pokemon.loaded
export const selectPokemonError = (state: RootState) => state.pokemon.error

export default pokemonSlice.reducer