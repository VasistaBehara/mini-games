import { Link } from 'react-router-dom';

export default function GameCard({ title, description, to, disabled }: { title: string; description: string; to?: string; disabled?: boolean }) {
  const content = (
    <div className={['card', !disabled ? 'clickable' : ''].filter(Boolean).join(' ')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{title}</div>
        {disabled ? <span className="pill">Coming soon</span> : <span className="pill">Play</span>}
      </div>
      <div className="subtitle">{description}</div>
    </div>
  );
  if (to && !disabled) return <Link to={to} style={{ display: 'block' }}>{content}</Link>;
  return content;
}
