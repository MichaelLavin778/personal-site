import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import RouteFavicon from './components/RouteFavicon';
import TutorialModeProvider from './providers/TutorialModeProvider';
import VolumeProvider from './providers/VolumeProvider';


const Home = lazy(() => import('./pages/Home'));
const Resume = lazy(() => import('./pages/Resume'));
const Showcase = lazy(() => import('./pages/Showcase'));

const App = () => (
	<TutorialModeProvider>
		<VolumeProvider>
			<BrowserRouter>
				<RouteFavicon />
				<Header />
				<Suspense fallback={null}>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/showcase" element={<Showcase />} />
						<Route path="/resume" element={<Resume />} />
					</Routes>
				</Suspense>
				<Footer />
			</BrowserRouter>
		</VolumeProvider>
	</TutorialModeProvider>
);

export default App;
