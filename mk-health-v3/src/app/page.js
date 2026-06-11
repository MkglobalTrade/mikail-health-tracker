import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <h1>MK Health v3</h1>
        <p>Complete health management with lab uploads, glucose monitoring, appointments, AI insights, and notifications.</p>
        <div className="hero-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/labs">Labs</Link>
          <Link href="/glucose">Glucose</Link>
        </div>
      </section>
    </main>
  );
}
