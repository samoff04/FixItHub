import { Radar, Users2, MessagesSquare, CalendarDays, UserPlus } from "lucide-react";
import Image from "next/image";
import { PublicNav } from "@/components/public-nav";
import { LandingHero } from "@/components/landing-hero";

const steps = [
  { n: "01", icon: UserPlus, title: "Build your profile", desc: "List your skills, the roles you play, and what you're aiming for — a hackathon win, a startup, a portfolio piece." },
  { n: "02", icon: Radar, title: "Get matched", desc: "FixitHub ranks people by shared skills, complementary roles, and shared goals — not just who's online." },
  { n: "03", icon: Users2, title: "Form your team", desc: "Send connection requests, open a team with the roles you're missing, and lock it in before the next deadline." },
];

export default function LandingPage() {
  return (
    <div className="relative -mt-8 overflow-hidden">
      <PublicNav />
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_20%,black,transparent)]" />

      <LandingHero />

      <section className="relative mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Radar, title: "Smart matching", desc: "Ranked by shared skills, complementary roles, and goals." },
          { icon: Users2, title: "Teams", desc: "Form open teams, set roles you're missing, and fill them fast." },
          { icon: CalendarDays, title: "Events", desc: "Browse hackathons and workshops, join in one click." },
          { icon: MessagesSquare, title: "Realtime chat", desc: "Message connections and teams the moment you match." },
        ].map((f, i) => (
          <div
            key={f.title}
            className="glass spotlight-card group rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-glow animate-riseIn"
            style={{ animationDelay: `${0.1 * i + 0.4}s` }}
          >
            <f.icon className="mb-3 text-accent transition-transform duration-300 group-hover:scale-110" size={22} />
            <p className="font-medium text-gray-100">{f.title}</p>
            <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="relative mx-auto max-w-4xl px-4 pb-24">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-accent">The process</p>
          <h2 className="font-display text-3xl font-semibold text-white">From solo to shipped, in three steps</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="glass spotlight-card relative rounded-2xl p-6">
              <span className="font-display absolute right-5 top-5 text-4xl font-bold text-white/5">{s.n}</span>
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-2.5 text-primary-light">
                <s.icon size={20} />
              </div>
              <p className="font-medium text-gray-100">{s.title}</p>
              <p className="mt-2 text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative border-t border-white/5 px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-gray-500 sm:flex-row">
          <span className="flex items-center gap-2">
            <Image src="/logo.png" alt="FixitHub" width={18} height={18} className="rounded-md" />
            FixitHub — built for students, by students.
          </span>
          <span>© {new Date().getFullYear()} FixitHub. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}