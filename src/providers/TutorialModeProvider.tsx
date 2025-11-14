import React, { useState } from 'react';
import TutorialContext from '../context/TutorialContext';
import { isMobile } from '../helpers/common';


const TutorialModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const storedTutorialSetting = localStorage.getItem('TUTORIAL');
	const [showTutorial, setShowTutorial] = useState<boolean>(storedTutorialSetting !== null ? storedTutorialSetting === 'true' : isMobile());

    const toggleTutorial = () => {
        setShowTutorial((show) => !show);
        localStorage.setItem('TUTORIAL', String(!showTutorial));
    };

    return (
        <TutorialContext.Provider value={{ showTutorial, toggleTutorial, setShowTutorial }}>
            {children}
        </TutorialContext.Provider>
    );
};

export default TutorialModeProvider;
