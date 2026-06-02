import { VolumeDown, VolumeUp } from "@mui/icons-material";
import { Box, Slider, Stack, Typography } from "@mui/material";
import { type RefObject, useContext, useEffect, useRef } from "react";
import dreadnaw from "../../assets/dreadnaw_the_bite_pokemon.ogg";
import VolumeContext from "../../context/VolumeContext";
import type { PokemonCry } from "../../model/PokemonVariant";
import CryAudio from "./CryAudio";

const setRefVolume = (ref: RefObject<HTMLAudioElement | null>, volume: number) => {
    // Volume range is 0.0 to 1.0
    const calculatedVolume = volume / 100;
    if (ref.current && ref.current.volume !== calculatedVolume)
        ref.current.volume = calculatedVolume;
}

const applyVolume = (refs: RefObject<HTMLAudioElement | null>[], volume: number) => {
    refs.forEach((ref) => setRefVolume(ref, volume));
}

type CriesProps = {
    cries: PokemonCry | undefined;
}

const Cries = ({ cries }: CriesProps) => {
    const { volume, setVolume } = useContext(VolumeContext);
    const audioLatestRef = useRef<HTMLAudioElement | null>(null);
    const audioLegacyRef = useRef<HTMLAudioElement | null>(null);
    const audioDreadnawRef = useRef<HTMLAudioElement | null>(null);
    const showDreadnawEasterEgg = cries?.latest?.includes("latest/834.ogg");

    // workaround to keep volume consistent across pokemon changes
    useEffect(() => {
        applyVolume([audioLatestRef, audioLegacyRef, audioDreadnawRef], volume);
    }, [cries?.latest, cries?.legacy, volume]);

    const handleVolumeChange = (_event: Event, value: number) => {
        const newVolume = value;
        setVolume(newVolume);
        localStorage.setItem('VOLUME', String(newVolume));
        applyVolume([audioLatestRef, audioLegacyRef, audioDreadnawRef], newVolume)
    };

    if (!cries?.latest && !cries?.legacy) return null;

    return (
        <>
            <Box>
                <Typography component="span" variant="caption" color="textSecondary">Cries</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
                {cries?.latest && (
                    <CryAudio ref={audioLatestRef} cry={cries.latest} label="Latest" />
                )}
                {cries?.legacy && (
                    <CryAudio ref={audioLegacyRef} cry={cries.legacy} label="Legacy" />
                )}
                {showDreadnawEasterEgg && (
                    <CryAudio ref={audioDreadnawRef} cry={dreadnaw} label="?" />
                )}
            </Stack>
            <Stack spacing={2} direction="row" sx={{ alignItems: 'center', maxWidth: 200 }}>
                <VolumeDown fontSize="small" />
                <Slider aria-label="Volume" value={volume} onChange={handleVolumeChange} size="small" />
                <VolumeUp fontSize="small" />
            </Stack>
        </>
    );
};

export default Cries;
