import { ThemeProvider } from '@material-ui/core'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './state/store.ts'
import theme from './theme/theme.tsx'
import App from './App.tsx'
import './index.css'


createRoot(document.getElementById('root')!).render(
	<Provider store={store}>
		<ThemeProvider theme={theme}>
			<App />
		</ThemeProvider>
	</Provider>,
);
