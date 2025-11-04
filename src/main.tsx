import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@material-ui/core'
import App from './App.tsx'
import './index.css'
import store from './store'
import theme from './theme/theme.tsx'

createRoot(document.getElementById('root')!).render(
	<Provider store={store}>
		<ThemeProvider theme={theme}>
			<App />
		</ThemeProvider>
	</Provider>,
);
