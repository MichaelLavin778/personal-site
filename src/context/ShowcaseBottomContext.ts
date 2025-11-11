import { createContext } from "react";

const ShowcaseBottomContext = createContext<{ bottom: number; }>({ bottom: 0 });

export default ShowcaseBottomContext;