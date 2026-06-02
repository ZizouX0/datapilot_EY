import {
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function RadarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ReRadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#E0E0E0" />
        <PolarAngleAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#555', fontFamily: 'DM Sans, sans-serif' }}
        />
        <Radar
          name="Current score"
          dataKey="current"
          stroke="#3D108A"
          fill="#3D108A"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Radar
          name="Target level"
          dataKey="target"
          stroke="#FFE600"
          fill="none"
          strokeWidth={2}
          strokeDasharray="5 5"
        />
        <Legend
          iconSize={10}
          formatter={(value) => (
            <span style={{ fontSize: 11, color: '#666', fontFamily: 'DM Sans, sans-serif' }}>
              {value}
            </span>
          )}
        />
      </ReRadarChart>
    </ResponsiveContainer>
  );
}
