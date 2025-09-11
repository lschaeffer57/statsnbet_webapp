import { Outlet } from 'react-router';

const AuthLayout = () => {
  return (
    <div className="px-5 pt-10 pb-5">
      <img
        src="/images/logo.png"
        className="mx-auto h-5 w-32"
        alt="statsnbet logo"
      />
      <Outlet />
    </div>
  );
};

export default AuthLayout;
