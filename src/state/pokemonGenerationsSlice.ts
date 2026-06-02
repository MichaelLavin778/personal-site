import { type PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PokemonItemSimple } from '../model/PokemonVariant';
import type { RootState } from './store';

export type PokemonGeneration = PokemonItemSimple & {
	id: number;
}

const initialState: PokemonGeneration[] = [];
let isGenerationListRequestInFlight = false;

const getGenerationId = (url: string) => {
	const match = url.match(/\/generation\/(\d+)\/?$/);
	return match ? Number(match[1]) : undefined;
};

export const loadGenerations = createAsyncThunk<
	PokemonGeneration[],
	void,
	{ rejectValue: string; state: RootState }
>('pokemon/generations', async (_: void, thunkAPI) => {
	isGenerationListRequestInFlight = true;
	try {
		const res = await fetch('https://pokeapi.co/api/v2/generation?limit=100000');
		if (!res.ok) throw Error(`Failed to fetch: ${res.status} ${res.statusText}`);

		const json = await res.json();
		const results: PokemonGeneration[] = Array.isArray(json?.results)
			? json.results.flatMap((generation: Record<string, unknown>) => {
				const name = String(generation['name'] ?? '');
				const url = String(generation['url'] ?? '');
				const id = getGenerationId(url);

				return name && url && id ? [{ id, name, url }] : [];
			})
			: [];

		return results.sort((a, b) => a.id - b.id);
	} catch (err: unknown) {
		const message = (err as Error)?.message ?? String(err);
		return thunkAPI.rejectWithValue(message);
	} finally {
		isGenerationListRequestInFlight = false;
	}
}, {
	condition: (_, { getState }) =>
		!isGenerationListRequestInFlight && getState().pokemon.generations.length === 0,
});

export const pokemonGenerationsSlice = createSlice({
	name: 'pokemonGenerations',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(loadGenerations.fulfilled, (_state, action: PayloadAction<PokemonGeneration[]>) =>
			action.payload
		);
	},
});

export const getGenerations = (state: RootState) => state.pokemon.generations;

export default pokemonGenerationsSlice.reducer;
