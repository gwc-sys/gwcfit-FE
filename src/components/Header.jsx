import React from 'react';

export default function Header() {
  return (
    <header className="dashboard-header">
      <div className="header-copy">
        <h1>Welcome back, John!</h1>
        <p>Here's what's happening with your clients today.</p>
      </div>

      <div className="header-actions">
        <button className="date-pill">May 14, 2025</button>
        <button className="circle-action" aria-label="Search">S</button>
        <button className="circle-action has-badge" aria-label="Notifications">N</button>
        <button className="circle-action" aria-label="Messages">M</button>
      </div>
    </header>
  );
}
