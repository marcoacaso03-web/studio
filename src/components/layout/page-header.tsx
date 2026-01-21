import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  children?: ReactNode;
};

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold font-headline text-primary">{title}</h1>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
