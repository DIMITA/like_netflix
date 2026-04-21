import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import SearchBar from './SearchBar';
import PlatformSelector from './PlatformSelector';

export default function Navbar() {
  const { favorites } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-netflix-gray hover:text-white'}`;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-netflix-dark shadow-xl' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      {/* Main nav */}
      <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="text-netflix-red font-black text-xl md:text-2xl tracking-wider shrink-0 hover:opacity-90 transition-opacity">
          NETFLIX CLONE
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={navLinkClass}>Accueil</NavLink>
          <NavLink to="/favorites" className={navLinkClass}>
            Favoris
            {favorites.length > 0 && (
              <span className="ml-1.5 bg-netflix-red text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                {favorites.length}
              </span>
            )}
          </NavLink>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <SearchBar />
          <div className="hidden md:flex w-8 h-8 rounded bg-netflix-red items-center justify-center text-white text-sm font-bold cursor-pointer hover:brightness-110">
            U
          </div>
          <button className="md:hidden text-white p-1" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen
              ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            }
          </button>
        </div>
      </div>

      {/* Platform selector (always visible) */}
      <PlatformSelector />

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-netflix-dark border-t border-gray-800 px-4 py-4 flex flex-col gap-3">
          <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>🏠 Accueil</NavLink>
          <NavLink to="/favorites" className={navLinkClass} onClick={() => setMenuOpen(false)}>
            ♥ Favoris{favorites.length > 0 && ` (${favorites.length})`}
          </NavLink>
        </div>
      )}
    </header>
  );
}
