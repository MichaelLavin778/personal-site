import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@material-ui/core'
import './index.css'
import App from './App.tsx'
import theme from './theme/theme.tsx'

createRoot(document.getElementById('root')!).render(
	<ThemeProvider theme={theme}>
		<App />
	</ThemeProvider>,
)
