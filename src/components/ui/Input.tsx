import { Eye, EyeOff } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { Skeleton } from './Skeleton';

const Input = ({
  className,
  type,
  icon,
  wrapperClassName,
  isLoading,
  skeletonClassName,
  ...props
}: ComponentProps<'input'> & {
  icon?: ReactNode;
  wrapperClassName?: string;
  isLoading?: boolean;
  skeletonClassName?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const inputElement = (
    <input
      type={inputType}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-foreground/50 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-xl border bg-transparent py-2.5 pr-3.5 pl-7 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        isPassword ? 'pr-10' : '',
        className,
      )}
      {...props}
    />
  );

  if (isLoading) {
    return <Skeleton className={cn('h-10 w-full', skeletonClassName)} />;
  }

  if (!icon && !isPassword) {
    return inputElement;
  }

  return (
    <div className={cn('relative w-full', wrapperClassName)}>
      {icon && (
        <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 -translate-y-1/2">
          {icon}
        </div>
      )}
      {inputElement}
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
};

export { Input };
