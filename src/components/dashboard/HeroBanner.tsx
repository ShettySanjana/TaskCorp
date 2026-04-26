import bannerImg from "@/assets/dashboard-banner.png";

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export default function HeroBanner({ eyebrow, title, subtitle, children }: Props) {
  return (
    <section className="card-elevated overflow-hidden bg-gradient-banner relative">
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-6 items-center">
        <div className="p-8 lg:p-10">
          <span className="inline-block text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-full">
            {eyebrow}
          </span>
          <h1 className="font-display text-3xl lg:text-4xl font-bold mt-4 leading-tight">{title}</h1>
          <p className="text-muted-foreground mt-3 max-w-xl">{subtitle}</p>
          {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
        </div>
        <div className="hidden md:block pr-6">
          <img src={bannerImg} alt="Team collaborating around a kanban board" width={520} height={260} className="w-full h-auto" />
        </div>
      </div>
    </section>
  );
}
