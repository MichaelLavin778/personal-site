import { Box, Divider, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { RadarChart, type RadarSeries } from '@mui/x-charts/RadarChart';
import type { PokemonStat } from "../../model/Pokemon";
import type { HighlightItemData } from "@mui/x-charts";
import { useEffect, useState } from "react";


interface StatsProps {
    stats: PokemonStat[] | undefined;
}

const Stats = ({ stats }: StatsProps) => {
    const [highlightedItem, setHighlightedItem] = useState<HighlightItemData | null>(null);

    const maxLevel = 100;
    const badNature = 0.9;
    const goodNature = 1.1;
    const maxEVs = 252;
    const maxIVs = 31;

    const metrics = [
        { name: 'HP', max: 714 },
        { name: 'Attack', max: 526 },
        { name: 'Defense', max: 614 },
        { name: 'Sp. Att', max: 535 },
        { name: 'Sp. Def', max: 614 },
        { name: 'Speed', max: 504 }
    ];
    const fallbackStats: PokemonStat[] = metrics.map((metric, i) => ({ base_stat: 0, effort: 0, stat: { name: metric.name, url: `https://pokeapi.co/api/v2/stat/${i + 1}/` } }));

    const calcMinStat = (name: string, base: number) => {
        let min = Math.floor((Math.floor(2 * base * maxLevel / 100) + 5) * badNature);
        if (name === 'hp')
            min = Math.floor(2 * base * maxLevel / 100) + maxLevel + 10;
        return min;
    }

    const calcMaxStat = (name: string, base: number) => {
        let max = Math.floor((Math.floor(((2 * base + maxIVs + Math.floor(maxEVs / 4)) * maxLevel) / 100) + 5) * goodNature);
        if (name === 'hp')
            max = Math.floor(((2 * base + maxIVs + Math.floor(maxEVs / 4)) * maxLevel) / 100) + maxLevel + 10;
        return max;
    }

    const baseData = (stats || fallbackStats).map(s => s.base_stat);
    const minData = (stats || fallbackStats).map(s => calcMinStat(s.stat.name, s.base_stat));
    const maxData = (stats || fallbackStats).map(s => calcMaxStat(s.stat.name, s.base_stat));

    const series = [
        {
            id: 'max',
            label: 'Max',
            data: maxData
        },
        {
            id: 'min',
            label: 'Min',
            data: minData
        },
        {
            id: 'base',
            label: 'Base',
            data: baseData
        },

    ];

    const currentSeries = series.find(s => s.id === highlightedItem?.seriesId);

    const withOptions = (series: RadarSeries[]) =>
        series.map((item) => ({
            ...item,
            fillArea: true,
            type: 'radar' as const,
        }));

    const handleHighLightedSeries = (_event: unknown, newHighLightedSeries: string) => {
        if (newHighLightedSeries !== null) {
            setHighlightedItem((prev) => ({
                ...prev,
                seriesId: newHighLightedSeries,
            }));
        }
    };

    useEffect(() => {
        if (!highlightedItem) setHighlightedItem({ seriesId: 'base' })
    }, [highlightedItem]);

    return (
        <>
            <Box>
                <Typography component="label" variant="caption" color="textSecondary">Stats</Typography>
            </Box>
            <Stack spacing={1} alignItems={'center'}>
                <ToggleButtonGroup
                    value={highlightedItem?.seriesId ?? null}
                    exclusive={true}
                    onChange={handleHighLightedSeries}
                    aria-label="highlighted series"
                    fullWidth={true}
                >
                    {series.slice().reverse().map((item) => (
                        <ToggleButton
                            key={item.id}
                            value={item.id}
                            aria-label={`series ${item.label}`}
                            sx={{ lineHeight: 0.25 }}
                        >
                            {item.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    sx={{ width: '100%' }}
                    alignItems="center"
                >
                    {highlightedItem?.seriesId && (
                        <code>
                            <Box border={1} borderRadius={4} borderColor="slategray" padding={2} margin={2} whiteSpace="nowrap">
                                <Box justifySelf="right">{currentSeries?.label}</Box>
                                <Divider sx={{ marginTop: 1, marginBottom: 1 }} />
                                <Box justifyItems="right">
                                    {currentSeries?.data.map((stat, i) => {
                                        const statName = metrics.at(i)?.name;
                                        return <Box key={statName}>{statName} {stat}</Box>
                                    })}
                                </Box>
                            </Box>
                        </code>
                    )}
                    <Box sx={{ width: '100%' }}>
                        <RadarChart
                            height={250}
                            highlight="series"
                            highlightedItem={highlightedItem}
                            onHighlightChange={setHighlightedItem}
                            slotProps={{ tooltip: { trigger: 'axis' } }}
                            series={withOptions(series)}
                            radar={{ metrics }}
                        />
                    </Box>
                </Stack>
            </Stack>
        </>
    );
}

export default Stats;
