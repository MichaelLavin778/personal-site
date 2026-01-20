import { type PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from './store'

const initialState: string[] = []

export const loadGenderlessPokemonList = createAsyncThunk<
	string[],
	void,
	{ rejectValue: string }
>('pokemon/genderlessList', async (_: void, thunkAPI) => {
	try {
		const apiUrl = 'https://pokeapi.co/api/v2/gender/3'
		const res = await fetch(apiUrl)
		if (!res.ok) throw Error(`Failed to fetch: ${res.status} ${res.statusText}`)

		const json = (await res.json()) as {
			pokemon_species_details?: Array<{
				pokemon_species?: { name?: string }
			}>
		}

		const names = (json.pokemon_species_details ?? [])
			.map((d) => d.pokemon_species?.name)
			.filter((n): n is string => typeof n === 'string' && n.length > 0)
			.map((n) => n.trim().toLowerCase())

		return Array.from(new Set(names))
	} catch (err: unknown) {
		const message = (err as Error)?.message ?? String(err)
		return thunkAPI.rejectWithValue(message)
	}
})

export const genderSlice = createSlice({
	name: 'gender',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
            loadGenderlessPokemonList.fulfilled,
            (_state, action: PayloadAction<string[]>) => action.payload
        )
	},
})

export const selectGenderlessPokemonNames = (state: RootState) => state.pokemon.gender

export default genderSlice.reducer
