import { Box, Grid, Tab, Tabs, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { toTitleCase } from "../../helpers/common";
import { useElementRect } from "../../hooks/useElementRect";
import type { PokemonVariant } from "../../model/PokemonVariant";
import FullPaper from "../FullPaper";
import BattleInfo from "./BattleInfo";
import Cries from "./Cries";
import PokemonSprites from "./PokemonSprites";

type PokemonProps = {
    pokemon: PokemonVariant;
}

type PokemonDetailsTab = 'battle' | 'description';

const PokemonDetails = ({ pokemon }: PokemonProps) => {
    // purpose of tracking this is to make right col the same height as the left
    const leftColRef = useRef<HTMLDivElement>(null);
    const leftColumnRect = useElementRect(leftColRef);

    // generation data
    // const generations = useAppSelector(getGenerations);
    // const [selectedGenerationId, setSelectedGenerationId] = useState<number>(generations.at(-1)?.id ?? 9);
    // const selectedGenerationValue = generations.some((generation) => generation.id === selectedGenerationId)
    //     ? selectedGenerationId
    //     : '';
    const [selectedTab, setSelectedTab] = useState<PokemonDetailsTab>('battle');

    // hide until pokemon is loaded
    if (!pokemon) return null;

    const heldItemNames = (pokemon.held_items ?? [])
        .map(({ item }) => toTitleCase(item.name.replace(/-/g, ' ')));

    return (
        <Grid container={true} spacing={2} alignItems="flex-start">
            {/* Sprites */}
            <PokemonSprites pokemon={pokemon} />

            {/* Tabs */}
            <Grid size={12}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '72px minmax(0, 1fr) 72px',
                        alignItems: 'center',
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Box />
                    <Tabs
                        aria-label="Pokemon details"
                        centered
                        onChange={(_event, tab: PokemonDetailsTab) => setSelectedTab(tab)}
                        value={selectedTab}
                        sx={{
                            minWidth: 0,
                            '& .MuiTab-root': {
                                minWidth: { xs: 0, sm: 90 },
                                px: { xs: 0.5, sm: 2 },
                            },
                        }}
                    >
                        <Tab
                            aria-controls="pokemon-details-panel-battle"
                            id="pokemon-details-tab-battle"
                            label="Battle"
                            value="battle"
                        />
                        <Tab
                            aria-controls="pokemon-details-panel-description"
                            id="pokemon-details-tab-description"
                            label="Description"
                            value="description"
                        />
                    </Tabs>
                    {/* <Box sx={{ justifySelf: 'end' }}>
                        <FormControl sx={{ minWidth: 72 }}>
                        <InputLabel htmlFor="pokemon-generation-input" id="pokemon-generation-label">Gen</InputLabel>
                            <Select
                                id="pokemon-generation-select"
                                inputProps={{ id: 'pokemon-generation-input' }}
                                labelId="pokemon-generation-label"
                                label="Gen"
                                name="pokemon-generation"
                                value={selectedGenerationValue}
                                onChange={(event) => setSelectedGenerationId(Number(event.target.value))}
                            >
                                {generations.map((generation) => (
                                    <MenuItem key={generation.id} value={generation.id}>
                                        {generation.id}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box> */}
                </Box>
            </Grid>

            {/* Battle Info */}
            {selectedTab === 'battle' && <BattleInfo pokemon={pokemon} />}

            {/* Description */}
            <Grid
                aria-labelledby="pokemon-details-tab-description"
                hidden={selectedTab !== 'description'}
                id="pokemon-details-panel-description"
                role="tabpanel"
                size={12}
            >
                {selectedTab === 'description' && (
                    <Grid container={true} spacing={2} alignItems="flex-start">
                        {/* Left column */}
                        <Grid size={{ md: 12, lg: 6 }} ref={leftColRef}>
                            <FullPaper>
                                <Grid container={true} spacing={1}>
                                    {/* Base exp */}
                                    <Grid size={4}>
                                        <>
                                            <Box>
                                                <Typography component="span" variant="caption" color="textSecondary">Base Experience</Typography>
                                            </Box>
                                            <Typography>{pokemon.base_experience ?? '-'}</Typography>
                                        </>
                                    </Grid>
                                    {/* Height */}
                                    <Grid size={4}>
                                        <>
                                            <Box>
                                                <Typography component="span" variant="caption" color="textSecondary">Height</Typography>
                                            </Box>
                                            <Typography>{pokemon.height ? pokemon.height / 10 : '-'} m</Typography>
                                        </>
                                    </Grid>
                                    {/* Weight */}
                                    <Grid size={4}>
                                        <>
                                            <Box>
                                                <Typography component="span" variant="caption" color="textSecondary">Weight</Typography>
                                            </Box>
                                            <Typography>{pokemon.weight ? pokemon.weight / 10 : '-'} kg</Typography>
                                        </>
                                    </Grid>

                                    {/* Cries */}
                                    <Grid size={12}>
                                        <Cries cries={pokemon.cries} />
                                    </Grid>
                                </Grid>
                            </FullPaper>
                        </Grid>

                        {/* Right column */}
                        <Grid size={{ md: 12, lg: 6 }}>
                            <FullPaper sx={{ minHeight: { lg: leftColumnRect.height || 'auto' } }}>
                                <Grid container={true} spacing={1}>
                                    {/* Hold items */}
                                    <Grid size={12}>
                                        <>
                                            <Box>
                                                <Typography component="span" variant="caption" color="textSecondary">Held Items</Typography>
                                            </Box>
                                            <Typography>{heldItemNames.length > 0 ? heldItemNames.join(', ') : '-'}</Typography>
                                        </>
                                    </Grid>
                                </Grid>
                            </FullPaper>
                        </Grid>
                    </Grid>
                )}
            </Grid>
        </Grid>
    );
};

export default PokemonDetails;
