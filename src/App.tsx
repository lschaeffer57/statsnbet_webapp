import { Toaster } from '@/components/ui/Toaster';
import AppRoutes from '@/router/AppRoutes';

function App() {
  return (
    <div className="bg-background font-geist text-foreground h-full">
      <AppRoutes />
      <Toaster />
    </div>
  );
}

export default App;
