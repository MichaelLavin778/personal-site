import { Icon, type IconProps } from "@mui/material";

const PlaywrightIcon = (props: IconProps) => (
	<Icon {...props}>
		<img
			src="https://playwright.dev/img/playwright-logo.svg"
			alt="Playwright logo"
			style={{ maxWidth: '100%', height: 'auto' }}
		/>
	</Icon>
);

export default PlaywrightIcon;
