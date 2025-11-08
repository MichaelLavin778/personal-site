import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import pokemonReducer from './pokemonSlice'
import pokemonMovesReducer from './pokemonMovesSlice'

const pokemonRootReducer = combineReducers({
	pokemon: pokemonReducer,
	moves: pokemonMovesReducer,
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