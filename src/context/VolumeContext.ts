import { createContext } from "react";

const VolumeContext = createContext<{ volume: number; setVolume: React.Dispatch<React.SetStateAction<number>>; }>({ volume: 0, setVolume: () => {} });

export default VolumeContext;