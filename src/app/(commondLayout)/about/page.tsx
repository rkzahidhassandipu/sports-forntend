export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="bg-brand-mid border-b border-brand-border py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-lime-500/10 text-lime-500 border border-lime-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4">About Us</span>
          <h1 className="font-display font-black text-5xl sm:text-6xl leading-tight mb-4">
            OUR <span className="text-lime-500">STORY</span>
          </h1>
          <p className="text-muted-foreground max-w-xl text-base leading-relaxed">
            Founded in 2019, SportPulse began with a simple goal — give every athlete in Bangladesh access to world-class training facilities and coaching expertise.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-2 gap-14 mb-16">
          <div>
            <h2 className="font-display font-black text-4xl mb-5">OUR <span className="text-lime-500">MISSION</span></h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              We believe every person deserves access to exceptional sports coaching — regardless of background or experience level. SportPulse connects passionate athletes with certified coaches through a seamless digital platform designed for the modern sports community.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              From football to gymnastics, swimming to boxing, we support over 12 sports disciplines with state-of-the-art facilities in Dhaka. Our role-based management platform ensures athletes, coaches, trainers, and administrators each have exactly the tools they need.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: "2,400+", label: "Active Members" },
              { num: "48", label: "Certified Coaches" },
              { num: "12", label: "Sports Programs" },
              { num: "6+", label: "Years of Excellence" },
            ].map((s) => (
              <div key={s.label} className="bg-brand-mid border border-brand-border rounded-xl p-6 text-center hover:border-lime-500/30 transition-colors">
                <div className="font-display font-black text-4xl text-lime-500 mb-2">{s.num}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display font-black text-4xl mb-8">MEET THE <span className="text-lime-500">COACHES</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: "Sohel Rahman", role: "Head Football Coach", initials: "SR", sport: "⚽" },
              { name: "Karim Hossain", role: "Head Swimming Coach", initials: "KH", sport: "🏊" },
              { name: "Nadia Islam", role: "Fitness & Conditioning", initials: "NI", sport: "🏋️" },
              { name: "Jalal Ahmed", role: "Boxing Coach", initials: "JA", sport: "🥊" },
            ].map((coach) => (
              <div key={coach.name} className="bg-brand-mid border border-brand-border rounded-xl p-6 text-center hover:border-lime-500/30 transition-all duration-200 hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lime-500 to-teal-500 flex items-center justify-center font-display font-black text-brand-dark text-lg mx-auto mb-4">
                  {coach.initials}
                </div>
                <div className="text-2xl mb-2">{coach.sport}</div>
                <h3 className="font-display font-bold text-lg mb-1">{coach.name}</h3>
                <p className="text-xs text-muted-foreground">{coach.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
