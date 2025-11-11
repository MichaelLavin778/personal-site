import { createContext } from "react";

const ShowcaseHeightContext = createContext<{ height: number; }>({ height: 0 });

export default ShowcaseHeightContext;