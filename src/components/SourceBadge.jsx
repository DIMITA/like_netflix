import { SOURCES } from '../utils/sourceConfig';

export default function SourceBadge({ source, small = false }) {
  const cfg = SOURCES[source];
  if (!cfg) return null;

  if (small) {
    return (
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded leading-none"
        style={{ backgroundColor: cfg.color + '33', color: cfg.color, border: `1px solid ${cfg.color}55` }}
      >
        {cfg.icon} {cfg.label}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded"
      style={{ backgroundColor: cfg.color + '22', color: cfg.color, border: `1px solid ${cfg.color}44` }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}
