import React, { useCallback, useMemo, useState } from 'react';
import TutorialContext from '../context/TutorialContext';
import { isMobile } from '../helpers/common';


const TutorialModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [showTutorial, setShowTutorial] = useState<boolean>(() => {
		const storedTutorialSetting = localStorage.getItem('TUTORIAL');
		return storedTutorialSetting !== null ? storedTutorialSetting === 'true' : !isMobile();
	});

	const toggleTutorial = useCallback(() => {
		const nextShowTutorial = !showTutorial;
		setShowTutorial(nextShowTutorial);
		localStorage.setItem('TUTORIAL', String(nextShowTutorial));
	}, [showTutorial]);
	const value = useMemo(() => ({
		showTutorial,
		toggleTutorial,
		setShowTutorial,
	}), [showTutorial, toggleTutorial]);

    return (
        <TutorialContext.Provider value={value}>
            {children}
        </TutorialContext.Provider>
    );
};

export default TutorialModeProvider;
