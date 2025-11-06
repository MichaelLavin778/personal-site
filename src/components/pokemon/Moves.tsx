import { InputLabel, Typography } from "@mui/material";
import type { PokemonMove } from "../../model/Pokemon";

interface MovesProps {
    moves: PokemonMove[] | undefined;
}

const Moves = ({ moves }: MovesProps) => {
    if (!moves || moves.length === 0) {
        return null;
    }

    return (
        <>
            <InputLabel>Moves</InputLabel>
            <Typography>{moves.map(move => move.move.name).join(', ')}</Typography>
        </>
    );
}

export default Moves;     