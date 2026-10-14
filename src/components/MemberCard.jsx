import React from 'react';

export default function MemberCard({ initials = 'MB', name = 'Member', status = 'Active', workouts = 18, progress = 72 }) {
  const active = status === 'Active';

  return (
    <article className="member-card">
      <div className="member-avatar">{initials}</div>
      <div className="member-body">
        <div className="member-topline">
          <strong>{name}</strong>
          <span className={active ? 'status-active' : 'status-inactive'}>{status}</span>
        </div>
        <div className="member-stats">
          <span>Workouts {workouts}</span>
          <span>Progress {progress}%</span>
        </div>
        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
    </article>
  );
}
