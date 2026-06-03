import { ReactNode } from 'react';
import { CardHeader, CardTitle } from '../shared/ui/card';

export function EntityListToolbar({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <CardHeader>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      </div>
    </CardHeader>
  );
}
