import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'bg-card border border-card-border text-foreground shadow-glass',
          title: 'text-foreground font-medium',
          description: 'text-muted-foreground',
          success: 'border-green-500/50 bg-green-500/10',
          error: 'border-red-500/50 bg-red-500/10',
        },
      }}
    />
  );
}
