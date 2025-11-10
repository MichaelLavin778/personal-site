import { type Dispatch, type SetStateAction, createContext } from "react";

const VolumeContext = createContext<{ volume: number; setVolume: Dispatch<SetStateAction<number>>; }>({ volume: 0, setVolume: () => {} });

export default VolumeContext;