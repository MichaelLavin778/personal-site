import { Box, type BoxProps } from "@mui/material";
import { getTypeColors } from "../../helpers/pokemonType";


interface TypeProps extends BoxProps {
    typeName: string;
}

const Type = ({ typeName, sx, ...props }: TypeProps) => {
    const { bgcolor, borderColor } = getTypeColors(typeName);

    return (
        <Box
            key={typeName}
            display="flex"
            color="white"
            bgcolor={bgcolor}
            width="100%"
            maxWidth="64px"
            height="100%"
            maxHeight="24px"
            border="1px solid"
            borderColor={borderColor}
            borderRadius={1}
            justifyContent="center"
            textAlign="center"
            fontSize=".75rem"
            lineHeight="1.5rem"
            textTransform="uppercase"
            sx={[
                { textShadow: "1px 1px 2px rgba(0, 0, 0, .7)" },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...props}
        >
            {typeName}
        </Box>
    );
};

export default Type;
