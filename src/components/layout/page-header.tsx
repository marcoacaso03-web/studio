
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: ReactNode;
  children?: ReactNode;
};

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground dark:text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
