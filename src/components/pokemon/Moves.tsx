import { InputLabel, Typography } from "@mui/material";
import type { PokemonMove } from "../../model/Pokemon";

interface MovesProps {
    moves: PokemonMove[] | undefined;
}

const Moves = ({ moves }: MovesProps) => {

    return (
        <>
            <InputLabel>Moves</InputLabel>
            <Typography>{moves?.map(move => move.move.name).join(', ') || '-'}</Typography>
        </>
    );
}

export default Moves;     