import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import MemberCard from '../components/MemberCard';

const stats = [
  { key: 'assigned', icon: 'US', number: 24, label: 'Assigned Members', delta: '+4 this week', tone: 'violet' },
  { key: 'active', icon: 'EC', number: 18, label: 'Active Members', delta: '+3 this week', tone: 'green' },
  { key: 'workouts', icon: 'DB', number: 42, label: 'Workouts', delta: '+8 this week', tone: 'blue' },
  { key: 'diets', icon: 'NT', number: 16, label: 'Diets', delta: '+2 this week', tone: 'amber' },
  { key: 'attendance', icon: 'CA', number: 12, label: 'Today Attendance', delta: '80% present', tone: 'cyan' },
  { key: 'sessions', icon: 'TR', number: 8, label: 'Completed Sessions', delta: '+2 this week', tone: 'pink' }
];

const quickActions = [
  ['+', 'Add Workout', 'Create new plan', 'violet'],
  ['DI', 'Assign Diet', 'Nutrition plan', 'green'],
  ['CA', 'Schedule', 'Session booking', 'pink'],
  ['MS', 'Message', 'Member chat', 'cyan'],
  ['RP', 'Reports', 'Performance', 'amber'],
  ['AI', 'AI Coach', 'Personalized tips', 'violet'],
  ['ME', 'Measurements', 'Body stats', 'cyan'],
  ['PH', 'Progress Photos', 'Before / after', 'pink'],
  ['GO', 'Goals', 'Track milestones', 'blue'],
  ['SP', 'Supplements', 'Track dosages', 'amber']
];

const members = [
  ['AJ', 'Alex Johnson', 'Active', 18, 72],
  ['SW', 'Sarah Williams', 'Active', 24, 65],
  ['MB', 'Mike Brown', 'Inactive', 12, 40],
  ['ED', 'Emily Davis', 'Active', 20, 80],
  ['DW', 'David Wilson', 'Active', 16, 60]
];

export default function Dashboard() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="dashboard-panel">
        <Header />

        <section className="stats-grid" aria-label="Key stats">
          {stats.map((item) => (
            <StatCard key={item.key} {...item} />
          ))}
        </section>

        <section className="section-block">
          <div className="section-heading">
            <h2>Quick Actions</h2>
            <button className="pill-button">Customize</button>
          </div>
          <div className="quick-actions-grid">
            {quickActions.map(([icon, title, subtitle, tone]) => (
              <button className="action-card" key={title}>
                <span className={`icon-badge ${tone}`}>{icon}</span>
                <span className="action-copy">
                  <strong>{title}</strong>
                  <small>{subtitle}</small>
                </span>
                <span className="chevron">&gt;</span>
              </button>
            ))}
          </div>
        </section>

        <section className="members-panel">
          <div className="section-heading">
            <h2>Assigned Members</h2>
            <button className="pill-button">View all &gt;</button>
          </div>
          <div className="member-carousel">
            {members.map(([initials, name, status, workouts, progress]) => (
              <MemberCard
                key={name}
                initials={initials}
                name={name}
                status={status}
                workouts={workouts}
                progress={progress}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
