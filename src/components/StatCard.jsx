import React from 'react';

export default function StatCard({ icon, number, label, delta, tone = 'violet' }) {
  return (
    <article className="stat-card">
      <span className={`icon-badge ${tone}`}>{icon}</span>
      <strong className="stat-number">{number}</strong>
      <span className="stat-label">{label}</span>
      <span className="stat-delta">^ {delta}</span>
    </article>
  );
}
