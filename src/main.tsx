import ThemeModeProvider from './providers/ThemeModeProvider.tsx'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './state/store.ts'
import App from './App.tsx'


createRoot(document.getElementById('root')!).render(
	<Provider store={store}>
		<ThemeModeProvider>
			<App />
		</ThemeModeProvider>
	</Provider>,
);
