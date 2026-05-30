import { type PayloadAction, createAction, createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import pLimit from 'p-limit';
import type { PokemonsMove } from '../model/Pokemon';
import type { PokemonMove } from '../model/PokemonMove';
import type { RootState } from './store';

const initialState: Record<string, PokemonMove> = {}
const moveRequestsInFlight = new Set<string>();

const getMoveNameFromApiUrl = (apiUrl: string) =>
    apiUrl.split('/').filter(Boolean).at(-1);

// Batched partial updates (apply many partial updates in a single dispatch)
const updateMovesBatch = createAction<PokemonMove[]>('moves/partialUpdateBatch')

export const loadAllPokemonMoves = createAsyncThunk<
    void,
    string[],
    { rejectValue: string; state: RootState }
>('pokemon/movesAll', async (apis, thunkAPI) => {
    const allMoves = selectAllMoves(thunkAPI.getState());
    const apisToLoad = apis.filter((api) => {
        const moveName = getMoveNameFromApiUrl(api);
        if (!api || moveRequestsInFlight.has(api) || (moveName && allMoves[moveName])) return false;

        moveRequestsInFlight.add(api);
        return true;
    });
    if (apisToLoad.length === 0) return;

    const limit = pLimit(5); // Limit to 5 concurrent requests

    // Buffer partial updates and dispatch them in batches to avoid dispatching
    // thousands of single-item updates which triggers many re-renders.
    const buffer: PokemonMove[] = [];
    const chunkSize = 10;
    const flushIntervalMs = 250;

    const flushBuffer = () => {
        if (buffer.length === 0) return;
        // capture and clear buffer atomically
        const payload = buffer.splice(0, Math.min(buffer.length, chunkSize));
        // dispatch the action created by the action creator so middleware/types behave
        thunkAPI.dispatch(updateMovesBatch(payload));
    }

    // Periodic flush so we don't wait for the chunk size if network is slow
    const timer = setInterval(flushBuffer, flushIntervalMs);

    try {
        // For each API, fetch and when the response comes back, parse it and
        // push into the buffer. The buffer will be flushed periodically or
        // once it reaches chunkSize.
        const tasks = apisToLoad.map((api) =>
            limit(async () => {
                const res = await fetch(api);
                if (!res.ok) throw Error(`Failed to fetch: ${res.status} ${res.statusText}`);

                const json = await res.json();
                const move = json as PokemonMove;
                // push into buffer for batched dispatch
                buffer.push(move);
                if (buffer.length >= chunkSize) flushBuffer();

            })
        )

        // Let sibling requests finish after a failure so successful late
        // responses are still stored and in-flight bookkeeping stays accurate.
        const results = await Promise.allSettled(tasks);
        while (buffer.length > 0) flushBuffer();

        const failedResult = results.find((result) => result.status === 'rejected');
        if (failedResult?.status === 'rejected') throw failedResult.reason;
    } catch (err: unknown) {
        const message = (err as Error)?.message ?? String(err);
        return thunkAPI.rejectWithValue(message);
    } finally {
        clearInterval(timer as ReturnType<typeof setInterval>);
        apisToLoad.forEach((api) => moveRequestsInFlight.delete(api));
    }
})

export const loadMove = createAsyncThunk<
    PokemonMove,
    string,
    { rejectValue: string }
>('pokemon/move', async (apiUrl, thunkAPI) => {
    try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw Error(`Failed to fetch: ${res.status} ${res.statusText}`);

        const json = await res.json();
        const results: PokemonMove = json;

        return results;
    } catch (err: unknown) {
        const message = (err as Error)?.message ?? String(err);
        return thunkAPI.rejectWithValue(message);
    }
})

export const pokemonMovesSlice = createSlice({
    name: 'moves',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(updateMovesBatch, (state, action: PayloadAction<PokemonMove[]>) => {
                action.payload.forEach(m => state[m.name] = m);
            })
            .addCase(loadMove.fulfilled, (state, action: PayloadAction<PokemonMove>) => {
                const key = action.payload.name;
                state[key] = action.payload;
            })
    },
})


export const selectAllMoves = (state: RootState) => state.pokemon.moves
export const selectMoveByName = (state: RootState, moveName?: string) =>
    moveName ? selectAllMoves(state)[moveName] : undefined;

export const makeSelectPokemonMoves = () => {
    let previousResult: PokemonMove[] = [];

    return createSelector(
        [selectAllMoves, (_: RootState, pokemonsMoves?: PokemonsMove[]) => pokemonsMoves],
        (all, pokemonsMoves) => {
            if (!Array.isArray(pokemonsMoves) || pokemonsMoves.length === 0) return previousResult;

            const result = pokemonsMoves
            .map(pm => pm?.move?.name && all ? all[pm.move.name] : undefined)
            .filter((m): m is PokemonMove => m !== undefined);
            const isUnchanged = result.length === previousResult.length &&
                result.every((move, index) => move === previousResult[index]);
            if (isUnchanged) return previousResult;

            previousResult = result;
            return result;
        }
    );
}

export default pokemonMovesSlice.reducer
