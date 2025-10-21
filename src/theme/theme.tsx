import { createTheme } from "@mui/material/styles";
import { green, purple } from '@mui/material/colors';

const theme = createTheme({
	components: {
		MuiStack: {
			defaultProps: {
				useFlexGap: true,
			},
		},
	},
	palette: {
		background: {
			default: '#242424',
		},
		primary: {
			main: purple[500],
		},
		secondary: {
			main: green[500],
		},
	},
});

export default theme