import { PlayArrow } from "@mui/icons-material"
import { Box, type BoxProps, Button } from "@mui/material"
import { forwardRef } from "react"


type CryAudioProps = BoxProps & {
    cry: string,
    label: string,
    disabled?: boolean
}

const CryAudio = forwardRef<HTMLAudioElement, CryAudioProps>(
    ({ cry, label, disabled, ...props }, ref) => (
        <Box component="span" {...props}>
            <audio ref={ref} src={cry} preload="auto" />
            <Button
                size="small"
                variant="outlined"
                startIcon={<PlayArrow />}
                onClick={() => {
                    if (ref && typeof ref !== "function") 
                        ref.current?.play()
                }}
                disabled={disabled}
            >
                {label}
            </Button>
        </Box>
    )
)

export default CryAudio