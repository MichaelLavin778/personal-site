import { type Dispatch, type SetStateAction, createContext } from "react";

const TutorialContext = createContext<{
    showTutorial: boolean;
    toggleTutorial: () => void;
    setShowTutorial: Dispatch<SetStateAction<boolean>>;
}>({
    showTutorial: false,
    toggleTutorial: () => {},
    setShowTutorial: () => {}
});

export default TutorialContext;