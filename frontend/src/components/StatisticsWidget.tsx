import type { CSSProperties } from 'react';

interface StatisticsWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  highlight?: string;
}

const widgetStyle: CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '1rem',
  backgroundColor: '#fff',
  minWidth: '160px',
};

export default function StatisticsWidget({
  title,
  value,
  subtitle,
  highlight,
}: StatisticsWidgetProps) {
  return (
    <article style={widgetStyle}>
      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>{title}</p>
      <h3 style={{ margin: '0.5rem 0', fontSize: '1.4rem' }}>{value}</h3>
      {subtitle && <p style={{ margin: 0, color: '#4b5563' }}>{subtitle}</p>}
      {highlight && <p style={{ margin: '0.4rem 0 0', color: '#2563eb' }}>{highlight}</p>}
    </article>
  );
}
