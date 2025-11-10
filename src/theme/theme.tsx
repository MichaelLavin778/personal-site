import { createTheme } from "@mui/material/styles";

const theme = createTheme({
	components: {
		MuiStack: {
			defaultProps: {
				useFlexGap: true,
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: "#1a1a1a"
				}
			}
		}
	},
	palette: {
		background: {
			default: '#242424',
		}
	},
});

export default theme;