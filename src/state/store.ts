import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import abilityReducer from './abilitySlice'
import pokemonGenerationsReducer from './pokemonGenerationsSlice'
import pokemonMovesReducer from './pokemonMovesSlice'
import pokemonReducer from './pokemonSlice'
import pokemonTypesReducer from './pokemonTypesSlice'

const pokemonRootReducer = combineReducers({
	pokemon: pokemonReducer,
	abilities: abilityReducer,
	generations: pokemonGenerationsReducer,
	moves: pokemonMovesReducer,
	types: pokemonTypesReducer,
})

const store = configureStore({
	reducer: {
		pokemon: pokemonRootReducer,
	},
	devTools: false,
})

export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
