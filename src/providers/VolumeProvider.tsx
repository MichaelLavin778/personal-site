import React, { useMemo, useState } from 'react';
import VolumeContext from '../context/VolumeContext';


const VolumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [volume, setVolume] = useState<number>(() => {
		const storedVolume = localStorage.getItem('VOLUME');
		return storedVolume ? Number(storedVolume) : 50;
	});
	const value = useMemo(() => ({
		volume,
		setVolume,
	}), [volume]);

	return (
		<VolumeContext.Provider value={value}>
			{children}
		</VolumeContext.Provider>
	);
};

export default VolumeProvider;
