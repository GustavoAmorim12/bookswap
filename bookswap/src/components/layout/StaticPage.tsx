import type { ReactNode } from "react";

interface StaticPageProps {
  title: string;
  children: ReactNode;
}

export default function StaticPage({ title, children }: StaticPageProps) {
  return (
    <section className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <div className="space-y-4 text-slate-700 leading-relaxed">
        {children}
      </div>
    </section>
  );
}
