import { makeStyles } from "@material-ui/core";
import { PlayArrow, VolumeDown, VolumeUp } from "@mui/icons-material";
import { Box, Button, InputLabel, Slider, Stack } from "@mui/material";
import { useContext, useEffect, useRef } from "react";
import VolumeContext from "../../context/VolumeContext";
import type { PokemonCry } from "../../model/Pokemon";

const useStyles = makeStyles(() => ({
    volumeSlider: {
        alignItems: 'center',
        maxWidth: 200
    }
}));

type CriesProps = {
    cries: PokemonCry | undefined;
}

const Cries = ({ cries }: CriesProps) => {
    const classes = useStyles();
    const { volume, setVolume } = useContext(VolumeContext);
    const audioLatestRef = useRef<HTMLAudioElement | null>(null);
    const audioLegacyRef = useRef<HTMLAudioElement | null>(null);

    // workaround to keep volume consistent across pokemon changes
    useEffect(() => {
        const calcVolume = volume / 100;
        if (audioLatestRef.current && audioLatestRef.current.volume !== calcVolume) {
            audioLatestRef.current.volume = calcVolume; // Volume range is 0.0 to 1.0
        }   
        if (audioLegacyRef.current && audioLegacyRef.current.volume !== calcVolume) {
            audioLegacyRef.current.volume = calcVolume;
        }
    });

    const handleVolumeChange = (_event: Event, value: number) => {
        const newVolume = value;
        setVolume(newVolume);
        if (audioLatestRef.current) {
            audioLatestRef.current.volume = newVolume / 100; // Volume range is 0.0 to 1.0
        }
        if (audioLegacyRef.current) {
            audioLegacyRef.current.volume = newVolume / 100;
        }
    };

    if (!cries?.latest && !cries?.legacy) {
        return null;
    }

    return (
        <>
            <InputLabel>Cries</InputLabel>
            {cries?.latest && (
                <Box component="span" sx={{ mr: cries?.legacy ? 1 : 0 }}>
                    <audio ref={audioLatestRef} src={cries.latest} preload="auto" />
                    <Button size="small" variant="outlined" startIcon={<PlayArrow />} onClick={() => audioLatestRef.current?.play()}>
                        Latest
                    </Button>
                </Box>
            )}
            {cries?.legacy && (
                <Box component="span">
                    <audio ref={audioLegacyRef} src={cries.legacy} preload="auto" />
                    <Button size="small" variant="outlined" startIcon={<PlayArrow />} onClick={() => audioLegacyRef.current?.play()}>
                        Legacy
                    </Button>
                </Box>
            )}
            <Stack spacing={2} direction="row" className={classes.volumeSlider}>
                <VolumeDown fontSize="small" />
                <Slider aria-label="Volume" value={volume} onChange={handleVolumeChange} size="small" />
                <VolumeUp fontSize="small" />
            </Stack>
        </>
    );
};

export default Cries;