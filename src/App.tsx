import AppRoutes from '@/router/AppRoutes';

function App() {
  return (
    <div className="bg-background font-geist text-foreground relative h-full">
      <div
        className="absolute inset-0 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: "url('/images/background.png')" }}
      />
      <div className="relative z-10">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
