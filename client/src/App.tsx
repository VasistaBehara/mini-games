import Router from './router';

export default function App() {
  return (
    <div className="container">
      <h1 className="title">Mini-Games</h1>
      <p className="subtitle">Have fun with small games</p>
      <div className="panel">
        <Router />
      </div>
    </div>
  );
}

