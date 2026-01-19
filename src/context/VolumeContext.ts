import { type Dispatch, type SetStateAction, createContext } from "react";


type VolumeContextValue = {
	volume: number;
	setVolume: Dispatch<SetStateAction<number>>;
};

const VolumeContext = createContext<VolumeContextValue>({
	volume: 0,
	setVolume: () => {},
});

export default VolumeContext;