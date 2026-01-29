import './Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h1 className="header__title">SemaSMS</h1>
      <p className="header__subtitle">Bulk SMS Sender</p>
    </header>
  );
}






