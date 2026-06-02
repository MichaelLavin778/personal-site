import { Container } from "@mui/material";
import type { ReactNode } from "react";
import { headerFooterPadding } from "../../model/common";

type ShowcaseContainerProps = {
	children: ReactNode;
};

const ShowcaseContainer = ({ children }: ShowcaseContainerProps) => (
	<Container
		sx={{
			display: 'flex',
			flex: 1,
			width: '100%',
			minHeight: '100vh',
			paddingTop: headerFooterPadding,
			paddingBottom: headerFooterPadding,
			height: '100%',
		}}
	>
		{children}
	</Container>
);

export default ShowcaseContainer;
