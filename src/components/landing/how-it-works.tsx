const steps = [
  {
    n: "01",
    title: "Sign up",
    body: "Create an account in under a minute with email or Google / Microsoft SSO.",
  },
  {
    n: "02",
    title: "Spin up a workspace",
    body: "Name it, pick a department, choose your team size — we'll preconfigure the rest.",
  },
  {
    n: "03",
    title: "Invite your team",
    body: "Bulk invite with role-based access: Admin, Manager, Developer, or Viewer.",
  },
  {
    n: "04",
    title: "Add docs, notes & tasks",
    body: "Start from templates or a blank canvas. Everything is searchable from day one.",
  },
  {
    n: "05",
    title: "Collaborate in real time",
    body: "Mention teammates, leave comments, and watch the activity feed update live.",
  },
  {
    n: "06",
    title: "Track what matters",
    body: "Use built-in analytics to see velocity, throughput, and team workload at a glance.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b bg-muted/30 py-section">
      <div className="mx-auto max-w-container px-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            From sign-up to shipping in six steps
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            No 90-minute onboarding call. No "implementation partner." You'll be productive on day one.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.n}
              className="relative rounded-xl border bg-card p-6 shadow-soft transition-shadow hover:shadow-elevated"
            >
              <div className="mb-3 inline-flex items-center justify-center rounded-md bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                {s.n}
              </div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}