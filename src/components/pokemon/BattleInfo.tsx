import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { Box, ButtonBase, Grid, Stack, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { useElementRect } from "../../hooks/useElementRect";
import type { PokemonType, PokemonVariant } from "../../model/PokemonVariant";
import FullPaper from "../FullPaper";
import Abilities from "./Abilities";
import Moves from "./Moves";
import Stats from "./Stats";
import Type from "./Type";
import TypeModal from "./TypeModal";

type BattleInfoProps = {
    pokemon: PokemonVariant;
}

const BattleInfo = ({ pokemon }: BattleInfoProps) => {
    // purpose of tracking this is to make right col the same height as the left
    const leftColRef = useRef<HTMLDivElement>(null);
    const leftColumnRect = useElementRect(leftColRef);
    const [typeModalTypes, setTypeModalTypes] = useState<PokemonType[] | null>(null);
    const displayedTypes = pokemon.types?.slice(0, 2) ?? [];

    return (
        <Grid
            aria-labelledby="pokemon-details-tab-battle"
            id="pokemon-details-panel-battle"
            role="tabpanel"
            size={12}
        >
            <Grid container={true} spacing={2} alignItems="flex-start">
                {/* Left column */}
                <Grid size={{ md: 12, lg: 5 }} ref={leftColRef}>
                    <FullPaper>
                        <Grid container={true} spacing={1}>
                            {/* Type(s) */}
                            <Grid size={6} sx={{ display: 'flex' }}>
                                <ButtonBase
                                    aria-label={`Open type matchup info for ${displayedTypes.map(t => t.type.name).join(' and ')}`}
                                    disabled={displayedTypes.length === 0}
                                    onClick={() => setTypeModalTypes(displayedTypes)}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        justifyContent: 'flex-start',
                                        width: '100%',
                                        height: '100%',
                                        textAlign: 'left',
                                        transition: 'background-color 120ms ease, border-color 120ms ease, transform 120ms ease',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                            borderColor: 'primary.main',
                                            transform: 'translateY(-1px)',
                                        },
                                        '&.Mui-focusVisible': {
                                            outline: '2px solid',
                                            outlineColor: 'primary.main',
                                            outlineOffset: 2,
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'grid', width: 'fit-content' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography component="span" variant="caption" color="textSecondary">Type</Typography>
                                            <OpenInFullIcon sx={{ ml: 'auto', fontSize: '1rem', color: 'text.secondary' }} />
                                        </Box>
                                        {displayedTypes.length > 0 ? (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {displayedTypes.map(t => (
                                                    <Type
                                                        key={t.type.name}
                                                        typeName={t.type.name}
                                                        sx={{ flexShrink: 0, width: 64 }}
                                                    />
                                                ))}
                                            </Stack>
                                        ) : '-'}
                                    </Box>
                                </ButtonBase>
                            </Grid>
                            {/* Abilities */}
                            <Grid size={6} sx={{ minHeight: 92 }}>
                                <Abilities pokemon={pokemon} />
                            </Grid>

                            {/* Stats chart */}
                            <Grid size={12}>
                                <Stats stats={pokemon.stats} />
                            </Grid>
                        </Grid>
                    </FullPaper>
                </Grid>

                {typeModalTypes && (
                    <TypeModal
                        initialTypes={typeModalTypes}
                        onClose={() => setTypeModalTypes(null)}
                    />
                )}

                {/* Right column */}
                <Grid size={{ md: 12, lg: 7 }}>
                    <FullPaper sx={{ minHeight: { lg: leftColumnRect.height || 'auto' } }}>
                        <Moves moves={pokemon.moves ?? []} lefColBottom={leftColumnRect.bottom} />
                    </FullPaper>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default BattleInfo;
