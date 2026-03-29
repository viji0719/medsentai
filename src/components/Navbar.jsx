import { Menu, MoonStar, ShieldPlus, SunMedium } from 'lucide-react';

function Navbar({ theme, onToggleTheme, onNavigate, currentView }) {
  const navItems = [
    { key: 'landing', label: 'Home' },
    { key: 'dashboard', label: 'Dashboard' },
  ];

  return (
    <header className="navbar">
      <button className="brand-mark reset-button" onClick={() => onNavigate('landing')}>
        <div className="brand-icon">
          <ShieldPlus size={18} />
        </div>
        <div>
          <strong>MedSentinel AI</strong>
          <span>Prescription Safety System</span>
        </div>
      </button>

      <nav className="nav-links">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={currentView === item.key ? 'nav-link active' : 'nav-link'}
            onClick={() => onNavigate(item.key)}
          >
            {item.label}
          </button>
        ))}
        <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle dark mode">
          {theme === 'light' ? <MoonStar size={18} /> : <SunMedium size={18} />}
        </button>
        <button className="mobile-menu" aria-label="Menu">
          <Menu size={18} />
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
