import React from 'react';

const navItems = [
  ['DB', 'Dashboard'],
  ['MB', 'Members'],
  ['WO', 'Workouts'],
  ['DI', 'Diets'],
  ['AT', 'Attendance'],
  ['MS', 'Messages'],
  ['SC', 'Schedule'],
  ['RP', 'Reports'],
  ['PH', 'Progress Photos'],
  ['ME', 'Measurements'],
  ['GO', 'Goals'],
  ['SP', 'Supplements'],
  ['AI', 'AI Coach']
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-row">
        <div className="brand-mark">PF</div>
        <div>
          <div className="brand-name">PulseFit</div>
          <div className="brand-role">TRAINER</div>
        </div>
      </div>

      <nav className="side-nav" aria-label="Dashboard navigation">
        {navItems.map(([icon, label]) => {
          const active = label === 'Dashboard';

          return (
            <button className={`side-link${active ? ' active' : ''}`} key={label}>
              <span>{icon}</span>
              <strong>{label}</strong>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-profile">
        <div className="profile-avatar">JT</div>
        <div>
          <strong>John Trainer</strong>
          <small>Trainer</small>
        </div>
        <span className="profile-caret">v</span>
      </div>
    </aside>
  );
}
