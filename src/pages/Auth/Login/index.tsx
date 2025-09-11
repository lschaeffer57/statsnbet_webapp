import { Button } from '@/components/ui/Button.tsx';
import { Input } from '@/components/ui/Input.tsx';

export const Login = () => {
  return (
    <div className="mt-[140px] flex flex-col items-center">
      <div className="max-w-[507px] space-y-12">
        <div className="space-y-4">
          <h1 className="font-instrument text-center text-[44px] leading-[50px] font-semibold tracking-tight">
            Connexion Statsnbet
          </h1>
          <div className="flex justify-center">
            <p className="text-muted-foreground max-w-[90%] text-center text-base font-normal">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et
              massa mi. Aliquam in hendrerit urna. Pellentesque sit amet.
            </p>
          </div>
        </div>
        <div className="mx-auto w-[386px] space-y-9">
          <div className="space-y-5">
            <div className="space-y-3">
              <Input placeholder="Email" className="w-full" />
              <Input placeholder="Mot de passe" className="w-full" />
            </div>
            <p className="text-muted-foreground text-sm">
              Vous avez oublié votre mot de passe ?{' '}
              <a
                href="/forgot-password"
                className="text-foreground text-sm font-medium"
              >
                Réinitialisez-le ici
              </a>
            </p>
            <div className="bg-border h-[1px] w-full" />
          </div>

          <Button className="w-full">Se connecter</Button>
        </div>
      </div>
    </div>
  );
};
