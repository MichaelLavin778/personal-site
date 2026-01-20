import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, Container, IconButton, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AmplifyIconButton from "./icon_buttons/AmplifyIconButton";
import MaterialUIIconButton from "./icon_buttons/MaterialUIIconButton";
import PlaywrightIconButton from "./icon_buttons/PlaywrightIconButton";
import ReactIconButton from "./icon_buttons/ReactIconButton";
import S3IconButton from "./icon_buttons/S3IconButton";
import ViteIconButton from "./icon_buttons/ViteIconButton";


const Footer = () => {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const icons = useMemo(
		() => [
			{ key: "amplify", node: <AmplifyIconButton /> },
			{ key: "s3", node: <S3IconButton /> },
			{ key: "vite", node: <ViteIconButton /> },
			{ key: "mui", node: <MaterialUIIconButton /> },
			{ key: "react", node: <ReactIconButton /> },
			{ key: "playwright", node: <PlaywrightIconButton /> },
		],
		[]
	);

	const updateNav = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;

		const maxScrollLeft = el.scrollWidth - el.clientWidth;
		setCanScrollLeft(el.scrollLeft > 0);
		setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
	}, []);

	useEffect(() => {
		updateNav();
		const el = scrollRef.current;
		if (!el) return;

		const onScroll = () => updateNav();
		el.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", updateNav);
		return () => {
			el.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", updateNav);
		};
	}, [updateNav]);

	const scrollByAmount = (direction: "left" | "right") => {
		const el = scrollRef.current;
		if (!el) return;

		const delta = Math.max(140, Math.floor(el.clientWidth * 0.7));
		el.scrollBy({ left: direction === "left" ? -delta : delta, behavior: "smooth" });
	};

	return (
		<Box
			component="footer"
			sx={{ position: "fixed", bottom: 0, left: 0, width: "100%", height: 50, overflow: "hidden" }}
		>
			<Container sx={{ height: "100%" }}>
				<Stack direction="row" sx={{ alignItems: "center", height: "100%", gap: 1 }}>
					<Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
						Powered by
					</Typography>

					<IconButton
						aria-label="Scroll technologies left"
						size="small"
						disabled={!canScrollLeft}
						onClick={() => scrollByAmount("left")}
						sx={{ flex: "0 0 auto", display: { xs: "inline-flex", md: "none" } }}
					>
						<ChevronLeftIcon fontSize="small" />
					</IconButton>

					<Box
						ref={scrollRef}
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === "ArrowLeft") scrollByAmount("left");
							if (e.key === "ArrowRight") scrollByAmount("right");
						}}
						sx={{
							flex: "1 1 auto",
							display: "flex",
							alignItems: "center",
							gap: 1,
							overflowX: "auto",
							overflowY: "hidden",
							scrollSnapType: "x mandatory",
							scrollBehavior: "smooth",
							WebkitOverflowScrolling: "touch",
							"&::-webkit-scrollbar": { display: "none" },
							msOverflowStyle: "none",
							scrollbarWidth: "none",
						}}
						aria-label="Technologies carousel"
					>
						{icons.map(({ key, node }) => (
							<Box key={key} sx={{ scrollSnapAlign: "center", flex: "0 0 auto" }}>
								{node}
							</Box>
						))}
					</Box>

					<IconButton
						aria-label="Scroll technologies right"
						size="small"
						disabled={!canScrollRight}
						onClick={() => scrollByAmount("right")}
						sx={{ flex: "0 0 auto", display: { xs: "inline-flex", md: "none" } }}
					>
						<ChevronRightIcon fontSize="small" />
					</IconButton>
				</Stack>
			</Container>
		</Box>
	);
};

export default Footer;
