export default function ModeSelect({ onPick }: { onPick: (mode: 'single' | 'local' | 'online') => void }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <button className="btn" onClick={() => onPick('single')}>Single vs AI</button>
      <button className="btn" onClick={() => onPick('local')}>Local 2P</button>
      <button className="btn" onClick={() => onPick('online')}>Online 2P</button>
    </div>
  );
}

