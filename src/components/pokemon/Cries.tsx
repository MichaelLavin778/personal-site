import { makeStyles } from "@material-ui/core";
import { VolumeDown, VolumeUp } from "@mui/icons-material";
import { Box, Slider, Stack, Typography } from "@mui/material";
import { useContext, useEffect, useRef } from "react";
import VolumeContext from "../../context/VolumeContext";
import type { PokemonCry } from "../../model/Pokemon";
import dreadnaw from "../../assets/dreadnaw_the_bite_pokemon.ogg"
import CryAudio from "./CryAudio";

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
    const audioDreadnawRef = useRef<HTMLAudioElement | null>(null);
    const showDreadnawEasterEgg = cries?.latest?.includes("latest/834.ogg");

    const setRefVolume = (ref: React.RefObject<HTMLAudioElement | null>, v: number) => {
        const calcVolume = v / 100;
        if (ref.current && ref.current.volume !== calcVolume) {
            ref.current.volume = calcVolume; // Volume range is 0.0 to 1.0
        }
    }

    const applyVolume = (newVolume: number) => {
        setRefVolume(audioLatestRef, newVolume);
        setRefVolume(audioLegacyRef, newVolume);
        setRefVolume(audioDreadnawRef, newVolume);
    }

    // workaround to keep volume consistent across pokemon changes
    useEffect(() => {
        applyVolume(volume);
    });

    const handleVolumeChange = (_event: Event, value: number) => {
        const newVolume = value;
        setVolume(newVolume);
        localStorage.setItem('VOLUME', String(newVolume));
        applyVolume(newVolume)
    };

    if (!cries?.latest && !cries?.legacy) {
        return null;
    }

    return (
        <>
            <Box>
                <Typography component="label" variant="caption" color="textSecondary">Cries</Typography>
            </Box>
            {cries?.latest && (
                <CryAudio ref={audioLatestRef} cry={cries.latest} label="Latest" sx={{ mr: cries?.legacy ? 1 : 0 }} />
            )}
            {cries?.legacy && (
                <CryAudio ref={audioLegacyRef} cry={cries.legacy} label="Legacy" />
            )}
            {showDreadnawEasterEgg && (
                <CryAudio ref={audioDreadnawRef} cry={dreadnaw} label="?" />
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