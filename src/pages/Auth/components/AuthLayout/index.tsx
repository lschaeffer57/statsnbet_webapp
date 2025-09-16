import { Outlet } from 'react-router';

const AuthLayout = () => {
  return (
    <div className="bg-primary-foreground font-geist text-foreground relative h-full">
      <div
        className="absolute inset-0 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: "url('/images/background.png')" }}
      />
      <div className="relative z-10 px-5 pt-10 pb-5">
        <img
          src="/images/logo.png"
          className="mx-auto h-5 w-32"
          alt="statsnbet logo"
        />
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
