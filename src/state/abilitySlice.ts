import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

type AbilityEffectEntry = {
	effect: string
	short_effect: string
	language: { name: string }
}

type AbilityFlavorTextEntry = {
	flavor_text: string
	language: { name: string }
	version_group?: { name: string }
}

export type AbilityApiResponse = {
	name: string
	effect_entries?: AbilityEffectEntry[]
	flavor_text_entries?: AbilityFlavorTextEntry[]
}

export type AbilityFetchState =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'success'; ability: AbilityApiResponse }
	| { status: 'error'; message: string }

type AbilityState = Record<string, AbilityFetchState> // keyed by ability URL

const initialState: AbilityState = {}

export const loadAbilityDetails = createAsyncThunk<
	{ url: string; ability: AbilityApiResponse },
	string,
	{ rejectValue: string }
>('abilities/loadOne', async (apiUrl: string, thunkAPI) => {
	try {
		const res = await fetch(apiUrl)
		if (!res.ok) throw Error(`Failed to fetch ability: ${res.status} ${res.statusText}`)

		const json = (await res.json()) as AbilityApiResponse
		return { url: apiUrl, ability: json }
	} catch (err: unknown) {
		const message = (err as Error)?.message ?? String(err)
		return thunkAPI.rejectWithValue(message)
	}
})

export const abilitySlice = createSlice({
	name: 'abilities',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(loadAbilityDetails.pending, (state, action) => {
				const url = action.meta.arg
				state[url] = { status: 'loading' }
			})
			.addCase(loadAbilityDetails.fulfilled, (state, action: PayloadAction<{ url: string; ability: AbilityApiResponse }>) => {
				state[action.payload.url] = { status: 'success', ability: action.payload.ability }
			})
			.addCase(loadAbilityDetails.rejected, (state, action) => {
				const url = action.meta.arg
				const message = (action.payload as string) ?? action.error.message ?? 'Failed to fetch ability'
				state[url] = { status: 'error', message }
			})
	},
})

export const selectAbilityCache = (state: RootState) => state.pokemon.abilities
export const selectAbilityFetchStateByUrl = (state: RootState, url?: string) =>
	(url ? (state.pokemon.abilities[url] ?? { status: 'idle' }) : ({ status: 'idle' } as AbilityFetchState))

export default abilitySlice.reducer

