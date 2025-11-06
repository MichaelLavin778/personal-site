import { InputLabel, Typography } from "@mui/material";
import type { PokemonStat } from "../../model/Pokemon";

interface StatsProps {
    stats: PokemonStat[] | undefined;
}

const Stats = ({ stats }: StatsProps) => {
    if (!stats || stats.length === 0) {
        return null;
    }

    return (
        <>
            <InputLabel>Stats</InputLabel>
            <Typography>{stats.map(s => `${s.stat.name} (${s.base_stat})`).join(', ')}</Typography>
        </>
    );
}

export default Stats;
