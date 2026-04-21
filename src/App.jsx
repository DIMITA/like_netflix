import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Navbar from './components/Navbar';
import MovieModal from './components/MovieModal';
import ToastContainer from './components/Toast';
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import Search from './pages/Search';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-netflix-dark">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/search" element={<Search />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <MovieModal />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
