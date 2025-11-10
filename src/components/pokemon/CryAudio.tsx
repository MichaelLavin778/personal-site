import { PlayArrow } from "@mui/icons-material"
import { Box, type BoxProps, Button } from "@mui/material"
import type { RefObject } from "react"


type CryAudioProps = BoxProps & {
    ref: RefObject<HTMLAudioElement | null>
    cry: string,
    label: string,
    disabled?: boolean
}

const CryAudio = ({ ref, cry, label, disabled, ...props } : CryAudioProps) => (
        <Box component="span" {...props}>
            <audio ref={ref} src={cry} preload="auto" />
            <Button size="small" variant="outlined" startIcon={<PlayArrow />} onClick={() => ref.current?.play()} disabled={disabled}>
                {label}
            </Button>
        </Box>
    )

export default CryAudio