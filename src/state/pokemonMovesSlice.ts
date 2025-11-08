import { createSelector, createSlice, createAsyncThunk, createAction, type PayloadAction } from '@reduxjs/toolkit'
import pLimit from 'p-limit';
import type { PokemonsMove } from '../model/Pokemon';
import type { PokemonMove } from '../model/PokemonMove';
import type { RootState } from '../store'

const initialState: Record<string, PokemonMove> = {}

// Batched partial updates (apply many partial updates in a single dispatch)
const updateMovesBatch = createAction<PokemonMove[]>('moves/partialUpdateBatch')

export const loadAllPokemonMoves = createAsyncThunk<
    PokemonMove[],
    string[],
    { rejectValue: string }
>('pokemon/movesAll', async (apis, thunkAPI) => {
    const limit = pLimit(5); // Limit to 5 concurrent requests

    // Buffer partial updates and dispatch them in batches to avoid dispatching
    // thousands of single-item updates which triggers many re-renders.
    const buffer: PokemonMove[] = []
    const chunkSize = 10
    const flushIntervalMs = 250 // flush every 200ms at least

    const flushBuffer = () => {
        if (buffer.length === 0) return
        // capture and clear buffer atomically
        const payload = buffer.splice(0, Math.min(buffer.length, chunkSize))
        // dispatch the action created by the action creator so middleware/types behave
        thunkAPI.dispatch(updateMovesBatch(payload))
    }

    // Periodic flush so we don't wait for the chunk size if network is slow
    const timer = setInterval(flushBuffer, flushIntervalMs)

    try {
        // For each API, fetch and when the response comes back, parse it and
        // push into the buffer. The buffer will be flushed periodically or
        // once it reaches chunkSize.
        const tasks = apis.map((api) =>
            limit(async () => {
                const res = await fetch(api)
                if (!res.ok) {
                    throw Error(`Failed to fetch: ${res.status} ${res.statusText}`)
                }
                const json = await res.json()
                const move = json as PokemonMove
                // push into buffer for batched dispatch
                buffer.push(move)
                if (buffer.length >= chunkSize) flushBuffer()

                return move
            })
        )

        // Wait for all to complete (we still flushed along the way). After all
        // completes, flush any remaining items.
    const results = (await Promise.all(tasks)) as PokemonMove[]

    // flush any remaining buffered items before returning
    // while (buffer.length > 0) flushBuffer()

    return results
    } catch (err: unknown) {
        // while (buffer.length > 0) flushBuffer()
        const message = (err as Error)?.message ?? String(err)
        return thunkAPI.rejectWithValue(message)
    } finally {
        clearInterval(timer as ReturnType<typeof setInterval>)
    }
})

export const loadMove = createAsyncThunk<
    PokemonMove,
    string,
    { rejectValue: string }
>('pokemon/move', async (apiUrl, thunkAPI) => {
    try {
        const res = await fetch(apiUrl);
        if (!res.ok) {
            throw Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
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
                action.payload.forEach(m => state[m.name] = m)
            })
            .addCase(loadMove.fulfilled, (state, action: PayloadAction<PokemonMove>) => {
                const key = action.payload.name
                state[key] = action.payload
            })
    },
})


export const selectAllMoves = (state: RootState) => state.pokemon.moves

export const makeSelectPokemonMoves = () => createSelector(
    [selectAllMoves, (_: RootState, pokemonsMoves?: PokemonsMove[]) => pokemonsMoves],
    (all, pokemonsMoves) => {
        if (!Array.isArray(pokemonsMoves) || pokemonsMoves.length === 0) return []
        return pokemonsMoves
            .map(pm => pm?.move?.name && all ? all[pm.move.name] : undefined)
            .filter((m): m is PokemonMove => m !== undefined)
    }
)

export default pokemonMovesSlice.reducer