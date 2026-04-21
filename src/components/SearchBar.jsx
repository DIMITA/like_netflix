import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SearchBar() {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isSearchPage = location.pathname === '/search';

  const handleToggle = () => {
    if (!expanded) {
      setExpanded(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (!query) {
      setExpanded(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      navigate(`/search?q=${encodeURIComponent(val.trim())}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    setExpanded(false);
    if (isSearchPage) navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <div className={`flex items-center border transition-all duration-300 rounded ${
        expanded ? 'bg-black/80 border-white w-44 sm:w-56 md:w-72' : 'border-transparent w-8'
      }`}>
        <button
          type="button"
          onClick={handleToggle}
          className="flex-shrink-0 p-1.5 text-white hover:text-netflix-red transition-colors"
          aria-label="Rechercher"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        {expanded && (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Titres, genres..."
            className="bg-transparent text-white text-sm flex-1 outline-none placeholder-gray-400 py-1 pr-1"
          />
        )}
        {expanded && query && (
          <button type="button" onClick={handleClear} className="p-1.5 text-gray-400 hover:text-white">
            ×
          </button>
        )}
      </div>
    </form>
  );
}
