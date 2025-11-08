import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import pokemonReducer from './state/pokemonSlice'
import pokemonMovesReducer from './state/pokemonMovesSlice'
import resumeReducer from './state/resumeSlice'

const pokemonRootReducer = combineReducers({
	pokemon: pokemonReducer,
	moves: pokemonMovesReducer,
})

const store = configureStore({
	reducer: {
		pokemon: pokemonRootReducer,
		resume: resumeReducer,
	},
	devTools: false,
})

export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store