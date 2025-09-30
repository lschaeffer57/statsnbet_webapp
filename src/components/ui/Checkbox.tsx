import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Skeleton } from './Skeleton';

function Checkbox({
  className,
  isLoading,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="size-3" />;
  }

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer data-[state=checked]:text-foreground data-[state=checked]:bg-muted border-border bg-muted data-[state=checked]:border-border focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-3 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-2" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
