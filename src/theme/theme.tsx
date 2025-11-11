import { createTheme } from "@mui/material/styles";

export const createAppTheme = (mode: 'light' | 'dark') => createTheme({
	palette: {
		mode,
		background: {
			default: mode === 'dark' ? '#242424' : '#ffffff',
		},
		primary: {
			main: mode === 'dark' ? '#90caf9' : '#1976d2',
		},
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				// global base rules so app layout does not depend on an external CSS file
				'html, body, #root': {
					height: '100%',
				},
				// end global base
				// style react-router-dom <Link> elements (they render as <a>)
				'a': {
					color: mode === 'dark' ? '#90caf9' : '#1976d2',
					textDecoration: 'none',
				},
				'a:hover': {
					textDecoration: 'underline',
				},
				'footer': {
					backgroundColor: mode === 'dark' ? '#1b1b1b' : '#5812daa8',
				},
			}
		},

		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: mode === 'dark' ? '#1a1a1a' : '#1976d2',
				}
			}
		},
		MuiContainer : {
			styleOverrides: {
				root: {
					height: '100%'
				}
			}
		},
		MuiStack: {
			defaultProps: {
				useFlexGap: true,
			},
		},
	}
});

// default export for existing imports (static default so module load is safe)
const defaultTheme = createAppTheme('dark');
export default defaultTheme;