import { useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import VolumeContext from './context/VolumeContext';
import Home from './pages/Home';
import Resume from './pages/Resume';
import Showcase from './pages/Showcase';


const App = () => {
	const storedVolume = localStorage.getItem('VOLUME');
	const [volume, setVolume] = useState<number>(storedVolume ? Number(storedVolume) :50);
	const volumeContextValue = useMemo(() => ({
		volume,
		setVolume
	}), [volume, setVolume]);

	return (
		<VolumeContext.Provider value={volumeContextValue}>
			<BrowserRouter>
				<Header />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/showcase" element={<Showcase />} />
					<Route path="/resume" element={<Resume />} />
				</Routes>
				<Footer />
			</BrowserRouter>
		</VolumeContext.Provider>
	);
};

export default App;
