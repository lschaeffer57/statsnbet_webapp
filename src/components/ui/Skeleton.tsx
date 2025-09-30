import { cn } from '@/lib/utils';

import { Card } from './Card';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-input animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

export function ChartPlaceholder() {
  const chartHeights = [45, 65, 30, 55, 40, 70, 35, 60, 50];

  return (
    <Card className="gap-2 p-4">
      <Skeleton className="mx-auto h-7 w-48" />
      <div className="flex h-64 items-end justify-between px-4 pb-8">
        <div className="flex h-full flex-col justify-between py-4">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
        </div>

        <div className="flex flex-1 items-end justify-between px-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton
                className="h-2 w-2 rounded-full"
                style={{ height: `${chartHeights[i]}px` }}
              />
              <Skeleton className="h-3 w-6" />
            </div>
          ))}
        </div>
      </div>
      <div className="text-center">
        <Skeleton className="mx-auto h-4 w-16" />
      </div>
    </Card>
  );
}

export { Skeleton };
