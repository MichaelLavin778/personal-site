import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import Home from './pages/Home';
import Resume from './pages/Resume';
import Showcase from './pages/Showcase';


const App = () => {
	return (
		<>
			<BrowserRouter>
				<Header />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/showcase" element={<Showcase />} />
					<Route path="/resume" element={<Resume />} />
				</Routes>
				<Footer />
			</BrowserRouter>
		</>
	);
};

export default App;
