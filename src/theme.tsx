import { createTheme } from "@mui/material/styles";
import type { Mode } from "./model/common";

export const createAppTheme = (mode: Mode) => createTheme({
	palette: {
		mode,
		background: {
			default: mode === 'dark' ? '#242424' : '#f1f3e0',
		},
		primary: {
			main: mode === 'dark' ? '#90caf9' : '#778873',
		},
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				// <Link> elements (they render as <a>)
				'a': {
					color: mode === 'dark' ? '#90caf9' : '#1976d2',
					textDecoration: 'none',
				},
				'a:hover': {
					textDecoration: 'underline',
				},
				// </Link>
				'footer': {
					backgroundColor: mode === 'dark' ? '#1a1a1a' : '#778873',
				},
			}
		},

		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: mode === 'dark' ? '#1a1a1a' : '#778873',
				}
			}
		},
		MuiLink: {
			styleOverrides: {
				root: {
					color: mode === 'dark' ? '#90caf9' : '#1976d2',
					textDecoration: 'none',
					'&:hover': {
						textDecoration: 'underline',
					},
				},
			}
		}
	}
});

// default export for existing imports (static default so module load is safe)
const defaultTheme = createAppTheme('dark');
export default defaultTheme;