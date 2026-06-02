import { type PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PokemonItemSimple } from '../model/PokemonVariant';
import type { PokemonTypeDetails } from '../model/PokemonTypeDetails';
import type { RootState } from './store';

const TYPE_API_ROOT = 'https://pokeapi.co/api/v2/type';

export type PokemonTypeFetchState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; type: PokemonTypeDetails }
    | { status: 'error'; message: string }

type PokemonTypesState = Record<string, PokemonTypeFetchState>;

const initialState: PokemonTypesState = {};
const idlePokemonTypeFetchState: PokemonTypeFetchState = { status: 'idle' };

export const getPokemonTypeResource = (name: string): PokemonItemSimple => ({
    name,
    url: `${TYPE_API_ROOT}/${name}/`,
});

export const loadPokemonTypeDetails = createAsyncThunk<
    { name: string; type: PokemonTypeDetails },
    PokemonItemSimple,
    { rejectValue: string; state: RootState }
>('types/loadOne', async (resource, thunkAPI) => {
    try {
        const res = await fetch(resource.url);
        if (!res.ok) throw Error(`Failed to fetch type: ${res.status} ${res.statusText}`);

        const json = (await res.json()) as PokemonTypeDetails;
        return { name: resource.name, type: json };
    } catch (err: unknown) {
        const message = (err as Error)?.message ?? String(err);
        return thunkAPI.rejectWithValue(message);
    }
}, {
    condition: (resource, { getState }) => {
        const status = getState().pokemon.types[resource.name]?.status;
        return status !== 'loading' && status !== 'success';
    },
});

export const pokemonTypesSlice = createSlice({
    name: 'types',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loadPokemonTypeDetails.pending, (state, action) => {
                state[action.meta.arg.name] = { status: 'loading' };
            })
            .addCase(
                loadPokemonTypeDetails.fulfilled,
                (state, action: PayloadAction<{ name: string; type: PokemonTypeDetails }>) => {
                    state[action.payload.name] = { status: 'success', type: action.payload.type };
                }
            )
            .addCase(loadPokemonTypeDetails.rejected, (state, action) => {
                const name = action.meta.arg.name;
                const message = action.payload ?? action.error.message ?? 'Failed to fetch type';
                state[name] = { status: 'error', message };
            });
    },
});

export const selectPokemonTypeFetchStateByName = (state: RootState, name?: string) =>
    (name ? (state.pokemon.types[name] ?? idlePokemonTypeFetchState) : idlePokemonTypeFetchState);

export default pokemonTypesSlice.reducer;
