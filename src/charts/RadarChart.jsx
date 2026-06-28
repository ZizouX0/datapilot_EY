import {
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import useSettingsStore from '../store/useSettingsStore';

const COPY = {
  en: { currentScore: 'Current score', targetLevel: 'Target level' },
  fr: { currentScore: 'Score actuel', targetLevel: 'Niveau cible' },
};

// Shared chart children so the screen and print variants stay in sync.
function chartChildren(c) {
  return [
    <PolarGrid key="grid" stroke="#E0E0E0" />,
    <PolarAngleAxis
      key="axis"
      dataKey="name"
      tick={{ fontSize: 11, fill: '#555', fontFamily: 'DM Sans, sans-serif' }}
    />,
    <Radar
      key="current"
      name={c.currentScore}
      dataKey="current"
      stroke="#3D108A"
      fill="#3D108A"
      fillOpacity={0.15}
      strokeWidth={2}
    />,
    <Radar
      key="target"
      name={c.targetLevel}
      dataKey="target"
      stroke="#FFE600"
      fill="none"
      strokeWidth={2}
      strokeDasharray="5 5"
    />,
    <Legend
      key="legend"
      iconSize={10}
      formatter={(value) => (
        <span style={{ fontSize: 11, color: '#666', fontFamily: 'DM Sans, sans-serif' }}>
          {value}
        </span>
      )}
    />,
  ];
}

export default function RadarChart({ data }) {
  const margin = { top: 10, right: 30, bottom: 10, left: 30 };
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;

  return (
    <>
      {/* Screen: responsive to the card width. */}
      <div className="no-print">
        <ResponsiveContainer width="100%" height={280}>
          <ReRadarChart data={data} margin={margin}>
            {chartChildren(c)}
          </ReRadarChart>
        </ResponsiveContainer>
      </div>

      {/* Print: fixed size so it always renders (ResponsiveContainer can't
          measure reliably during printing). Centered in the full-width card. */}
      <div className="print-only">
        <div style={{ width: 520, margin: '0 auto' }}>
          <ReRadarChart width={520} height={320} data={data} margin={margin}>
            {chartChildren(c)}
          </ReRadarChart>
        </div>
      </div>
    </>
  );
}
