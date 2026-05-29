import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Box, Button, Typography } from "@mui/material";
import getPokemonLabel from "../../helpers/PokemonLabel";
import type { Pokemon } from "../../model/Pokemon";

type PokemonNavigationButtonProps = {
	direction: 'previous' | 'next';
	pokemon: Pokemon | undefined;
	onClick: () => void;
}

const PokemonNavigationButton = ({ direction, pokemon, onClick }: PokemonNavigationButtonProps) => {
	const isPrevious = direction === 'previous';
	const label = pokemon ? (getPokemonLabel(pokemon.name) ?? pokemon.name) : '';
	const directionLabel = isPrevious ? 'Previous' : 'Next';

	return (
		<Button
			type="button"
			variant="outlined"
			color="inherit"
			disabled={!pokemon}
			onClick={onClick}
			aria-label={pokemon ? `${directionLabel} Pokemon: ${label}` : `${directionLabel} Pokemon unavailable`}
			sx={{
				width: '100%',
				minHeight: 54,
				minWidth: 0,
				px: 1,
				py: 0.75,
				color: 'text.primary',
				borderColor: 'divider',
				bgcolor: 'background.paper',
				textTransform: 'none',
				justifyContent: isPrevious ? 'flex-start' : 'flex-end',
				'&:hover': {
					borderColor: 'text.secondary',
					bgcolor: 'action.hover',
				},
				'&.Mui-disabled': {
					color: 'text.disabled',
					borderColor: 'divider',
				},
			}}
		>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: isPrevious ? 'flex-start' : 'flex-end',
					gap: 0.5,
					minWidth: 0,
					width: '100%',
				}}
			>
				{isPrevious && <NavigateBeforeIcon fontSize="small" />}
				<Box sx={{ minWidth: 0, textAlign: isPrevious ? 'left' : 'right' }}>
					<Typography display="block" variant="caption" color="textSecondary" lineHeight={1.2}>
						{directionLabel}
					</Typography>
					<Typography
						display="block"
						variant="body2"
						fontWeight={600}
						lineHeight={1.25}
						sx={{
							maxWidth: { xs: 'calc(50vw - 64px)', md: 132 },
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{label || '-'}
					</Typography>
				</Box>
				{!isPrevious && <NavigateNextIcon fontSize="small" />}
			</Box>
		</Button>
	);
};

export default PokemonNavigationButton;
