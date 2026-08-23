import Link from "next/link";
import { ArrowRight, Users2, Radar, MessagesSquare, CalendarDays } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative -mt-8 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <section className="relative flex flex-col items-center px-4 pb-24 pt-28 text-center">
        <span className="glass mb-6 rounded-full px-4 py-1.5 text-xs text-accent">For students, by students</span>
        <h1 className="font-display max-w-3xl text-5xl font-semibold leading-tight text-white md:text-6xl">
          Build your <span className="gradient-text">dream team</span> for what&apos;s next
        </h1>
        <p className="mt-5 max-w-xl text-gray-400">
          FixitHub matches you with teammates by skill, role, and goal — then helps you form a team, join events, and ship together.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-medium text-white shadow-glow hover:brightness-110">
            Get started <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="glass inline-flex items-center rounded-xl px-6 py-3 text-sm font-medium text-gray-200 hover:bg-white/10">
            Sign in
          </Link>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Radar, title: "Smart matching", desc: "Ranked by shared skills, complementary roles, and goals." },
          { icon: Users2, title: "Teams", desc: "Form open teams, set roles you're missing, and fill them fast." },
          { icon: CalendarDays, title: "Events", desc: "Browse hackathons and workshops, join in one click." },
          { icon: MessagesSquare, title: "Realtime chat", desc: "Message connections and teams the moment you match." },
        ].map((f) => (
          <div key={f.title} className="glass rounded-2xl p-5 text-left">
            <f.icon className="mb-3 text-accent" size={22} />
            <p className="font-medium text-gray-100">{f.title}</p>
            <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}