import { Paper, type PaperProps } from "@mui/material";

const FullPaper = ({ children, ...props }: PaperProps) => {
    const sx = props.sx || {};

    return (
        <Paper
            {...props}
            variant="elevation"
            sx={{
                p: 2,
                ...sx,
                // MUI "elevation" shadows are intentionally directional (drop-shadow style).
                // Override to make the shadow feel even on all sides.
                boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                        ? '0 0 4px rgba(0,0,0,0.65)'
                        : '0 0 4px rgba(0,0,0,0.22)',
            }}
            elevation={0}
        >
            {children}
        </Paper>
    );
};

export default FullPaper;
