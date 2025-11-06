import { makeStyles } from "@material-ui/core";
import { Box } from "@mui/material";

const useStyles = makeStyles(() => ({
    typeBox: {
        maxWidth: '64px',
        width: '100%',
        maxHeight: '24px',
        height: '100%',
        border: '1px solid',
        borderRadius: 4,
        color: 'white',
        textAlign: 'center',
        justifyContent: 'center'
    }
}));

interface TypeProps {
    typeName: string;
}

const Type = ({ typeName }: TypeProps) => {
    const classes = useStyles();

    let bgcolor = "";
    let borderColor = "";

    switch (typeName) {
        case 'normal':
            bgcolor = "#AAAA99";
            borderColor = "#888883";
            break;
        case 'fire':
            bgcolor = "#FF4422";
            borderColor = "#CC3311";
            break;
        case 'water':
            bgcolor = "#3399FF";
            borderColor = "#2277CC";
            break;
        case 'electric':
            bgcolor = "#FFD451";
            borderColor = "#FFBB22";
            break;
        case 'grass':
            bgcolor = "#77CC55";
            borderColor = "#559933";
            break;
        case 'ice':
            bgcolor = "#66CCFF";
            borderColor = "#33AAFF";
            break;
        case 'fighting':
            bgcolor = "#BB5544";
            borderColor = "#AA4433";
            break;
        case 'poison':
            bgcolor = "#AA5599";
            borderColor = "#993388";
            break;
        case 'ground':
            bgcolor = "#DDBB55";
            borderColor = "#CCAA33";
            break;
        case 'flying':
            bgcolor = "#8899FF";
            borderColor = "#6677DD";
            break;
        case 'psychic':
            bgcolor = "#FF5599";
            borderColor = "#FF3388";
            break;
        case 'bug':
            bgcolor = "#AABB22";
            borderColor = "#99AA11";
            break;
        case 'rock':
            bgcolor = "#BBAA66";
            borderColor = "#AA9955";
            break;
        case 'ghost':
            bgcolor = "#6666BB";
            borderColor = "#5555AA";
            break;
        case 'dragon':
            bgcolor = "#7766EE";
            borderColor = "#5544CC";
            break;
        case 'dark':
            bgcolor = "#775544";
            borderColor = "#664433";
            break;
        case 'steel':
            bgcolor = "#AAAABB";
            borderColor = "#888899";
            break;
        case 'fairy':
            bgcolor = "#EE99EE";
            borderColor = "#DD77DD";
            break;
    }

    return (
        <Box key={typeName} component="span" bgcolor={bgcolor} borderColor={borderColor} className={classes.typeBox}>
            {typeName.toLocaleUpperCase()}
        </Box>
    );
};

export default Type;
