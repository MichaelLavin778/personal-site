import { PlayArrow } from "@mui/icons-material"
import { Box, Button, type BoxProps } from "@mui/material"


type CryAudioProps = BoxProps & {
    ref: React.RefObject<HTMLAudioElement | null>
    cry: string,
    label: string,
    disabled?: boolean
}

const CryAudio = ({ ref, cry, label, disabled, ...props } : CryAudioProps) => {
    return (
        <Box component="span" {...props}>
            <audio ref={ref} src={cry} preload="auto" />
            <Button size="small" variant="outlined" startIcon={<PlayArrow />} onClick={() => ref.current?.play()} disabled={disabled}>
                {label}
            </Button>
        </Box>
    )
}

export default CryAudio