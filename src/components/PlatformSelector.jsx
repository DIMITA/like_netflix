import { useApp } from '../contexts/AppContext';
import { SOURCE_LIST, isSourceAvailable } from '../utils/sourceConfig';

export default function PlatformSelector() {
  const { activeSources, toggleSource } = useApp();

  return (
    <div className="bg-black/60 backdrop-blur-sm border-b border-gray-800/60 px-4 md:px-8 py-2.5">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide min-w-0">
        <span className="text-gray-500 text-xs font-medium shrink-0 pr-1">Plateforme :</span>

        {SOURCE_LIST.map(source => {
          const active = activeSources.includes(source.id);
          const available = isSourceAvailable(source.id);

          return (
            <button
              key={source.id}
              onClick={() => toggleSource(source.id)}
              title={available ? source.description : `Clé API manquante (${source.envKey})`}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                transition-all duration-200 shrink-0 border
                ${active && available
                  ? 'text-white border-transparent shadow-md scale-100'
                  : available
                    ? 'text-gray-400 bg-transparent border-gray-700 hover:border-gray-500 hover:text-gray-200'
                    : 'text-gray-600 bg-transparent border-gray-800 cursor-not-allowed opacity-50'
                }
              `}
              style={active && available ? { backgroundColor: source.color, borderColor: source.color } : {}}
              disabled={!available}
            >
              <span>{source.icon}</span>
              <span>{source.label}</span>
              {!available && <span className="text-xs">🔑</span>}
            </button>
          );
        })}

        {/* Legend */}
        <div className="ml-auto shrink-0 flex items-center gap-1 text-gray-600 text-xs">
          <span>🔑 = clé manquante</span>
        </div>
      </div>
    </div>
  );
}
