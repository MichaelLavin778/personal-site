import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { Box, ButtonBase, Grid, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { useElementRect } from "../../hooks/useElementRect";
import type { PokemonType, PokemonVariant } from "../../model/PokemonVariant";
import FullPaper from "../FullPaper";
import Abilities from "./Abilities";
import Cries from "./Cries";
import Moves from "./Moves";
import SpriteBlock from "./SpriteBlock";
import Stats from "./Stats";
import Type from "./Type";
import TypeModal from "./TypeModal";

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
    const [typeModalTypes, setTypeModalTypes] = useState<PokemonType[] | null>(null);

    // hide until pokemon is loaded
    if (!pokemon) return null;

    const name = pokemon.name;
    const gender = pokemon.gender;
    const displayedTypes = pokemon.types?.slice(0, 2) ?? [];

    // determine which sprites are available
    const hasAnyMaleDefaultSprites =
        !!pokemon.sprites?.front_default ||
        !!pokemon.sprites?.back_default;
    const hasAnyShinySprites =
        !!pokemon.sprites?.front_shiny ||
        !!pokemon.sprites?.back_shiny;
    const hasAnyFemaleDefaultSprites =
        !!pokemon.sprites?.front_female ||
        !!pokemon.sprites?.back_female;
    const hasAnyFemaleShinySprites =
        !!pokemon.sprites?.front_shiny_female ||
        !!pokemon.sprites?.back_shiny_female;
    const hasAnyFemaleSprites = hasAnyFemaleDefaultSprites || hasAnyFemaleShinySprites;

    // background color for sprite cards
    const maleBlue = 'rgba(108, 160, 220, 0.3)';
    const femalePink = 'rgba(248, 185, 212, 0.5)';
    const genderlessGray = 'rgba(192, 192, 192, 0.3)';
    let backgroundMaleOrDefault = genderlessGray;
    let showMaleSymbol = false;
    let showFemaleSymbol = false;
    const femaleOverride = [
        "pikachu-cosplay",
        "pikachu-rock-star",
        "pikachu-belle",
        "pikachu-pop-star",
        "pikachu-phd",
        "pikachu-libre",
    ];
    const isFemaleOverride = femaleOverride.includes(name);
    if (gender === 'male' || (gender === 'both' && hasAnyFemaleSprites)) {
        backgroundMaleOrDefault = maleBlue;
        showMaleSymbol = true;
    } else if (isFemaleOverride) {
        // some pokemon that are female only are labeled as genderless while using the male sprite slot
        backgroundMaleOrDefault = femalePink;
        showFemaleSymbol = true;
    } else if (gender === 'both')
        backgroundMaleOrDefault = `linear-gradient(135deg, ${maleBlue} 0%, ${maleBlue} calc(50% - 1px), rgba(128, 128, 128, 0.5) 50%, ${femalePink} calc(50% + 1px), ${femalePink} 100%)`;

    const spriteCardCount = [
        hasAnyMaleDefaultSprites,
        hasAnyShinySprites,
        hasAnyFemaleDefaultSprites,
        hasAnyFemaleShinySprites,
    ].filter(Boolean).length;
    const compactSprites = spriteCardCount > 2;

    return (
        <Grid container={true} spacing={2} alignItems="flex-start">
            {/* Sprites */}
            <Grid
                size={12}
                textAlign="center"
                alignContent="center"
                sx={{
                    minHeight: 104,
                    '@media (max-width:447px)': {
                        minHeight: 204,
                    },
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 1,
                        width: '100%',
                    }}
                >
                    {/* Male / Male+Female Sprite */}
                    {hasAnyMaleDefaultSprites && (
                        <SpriteBlock
                            background={backgroundMaleOrDefault}
                            compact={compactSprites}
                            name={name}
                            showFemaleSymbol={showFemaleSymbol}
                            showMaleSymbol={showMaleSymbol}
                            spriteBack={pokemon.sprites?.back_default || undefined}
                            spriteFront={pokemon.sprites?.front_default || undefined}
                        />
                    )}
                    {/* Shiny Sprite */}
                    {hasAnyShinySprites && (
                        <SpriteBlock
                            background={backgroundMaleOrDefault}
                            compact={compactSprites}
                            name={name}
                            showFemaleSymbol={showFemaleSymbol}
                            showMaleSymbol={showMaleSymbol}
                            showShinySymbol={true}
                            spriteBack={pokemon.sprites?.back_shiny || undefined}
                            spriteFront={pokemon.sprites?.front_shiny || undefined}
                        />
                    )}
                    {/* Female Sprite */}
                    {hasAnyFemaleDefaultSprites && (
                        <SpriteBlock
                            background={femalePink}
                            compact={compactSprites}
                            name={name}
                            showFemaleSymbol={true}
                            showMaleSymbol={false}
                            spriteBack={pokemon.sprites?.back_female || undefined}
                            spriteFront={pokemon.sprites?.front_female || undefined}
                        />
                    )}
                    {/* Female Shiny Sprite */}
                    {hasAnyFemaleShinySprites && (
                        <SpriteBlock
                            background={femalePink}
                            compact={compactSprites}
                            name={name}
                            showFemaleSymbol={true}
                            showMaleSymbol={false}
                            showShinySymbol={true}
                            spriteBack={pokemon.sprites?.back_shiny_female || undefined}
                            spriteFront={pokemon.sprites?.front_shiny_female || undefined}
                        />
                    )}
                </Box>
            </Grid>

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
                            disabled={true}
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
            <Grid
                aria-labelledby="pokemon-details-tab-battle"
                hidden={selectedTab !== 'battle'}
                id="pokemon-details-panel-battle"
                role="tabpanel"
                size={12}
            >
                {selectedTab === 'battle' && (
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
                )}
            </Grid>

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
                        <Grid size={{ md: 12, lg: 5 }} ref={leftColRef}>
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
                        <Grid size={{ md: 12, lg: 7 }}>
                            <FullPaper sx={{ minHeight: { lg: leftColumnRect.height || 'auto' } }}>
                            </FullPaper>
                        </Grid>
                    </Grid>
                )}
            </Grid>
        </Grid>
    );
};

export default PokemonDetails;
