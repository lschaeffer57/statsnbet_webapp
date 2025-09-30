import { useSignIn } from '@clerk/clerk-react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { RoutesEnum } from '@/enums/router';

export const ForgotPassword = () => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [error, setError] = useState('');
  const { isLoaded, signIn, setActive } = useSignIn();

  if (!isLoaded) {
    return null;
  }

  async function create(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    await signIn
      ?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      .then(() => {
        setSuccessfulCreation(true);
        setError('');
      })
      .catch((err) => {
        console.error('error', err.message || 'An error occurred');
        setError(err.message || 'An error occurred');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  async function reset(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    await signIn
      ?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })
      .then((result) => {
        if (result.status === 'complete') {
          setActive({ session: result.createdSessionId });
          setError('');
        } else {
          console.error(result);
        }
      })
      .catch((err) => {
        console.error('error', err.message || 'An error occurred');
        setError(err.message || 'An error occurred');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="mt-[140px] flex flex-col items-center">
      <div className="max-w-[507px] space-y-12">
        <div className="space-y-4">
          <h1 className="font-instrument text-center text-[44px] leading-[50px] font-semibold tracking-tight">
            {t('forgotPassword.title')}
          </h1>
          <div className="flex justify-center">
            <p className="text-muted-foreground max-w-[90%] text-center text-base font-normal">
              {t('forgotPassword.description')}
            </p>
          </div>
        </div>
        <form onSubmit={!successfulCreation ? create : reset}>
          {!successfulCreation && (
            <>
              <div className="mb-2">
                <Label
                  htmlFor="email"
                  className="text-muted-foreground mb-2 text-sm font-medium"
                >
                  {t('forgotPassword.form.emailLabel')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('forgotPassword.form.emailPlaceholder')}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="mt-3 w-full"
              >
                {t('forgotPassword.form.sendCodeButton')}
              </Button>
              {error && (
                <p className="text-destructive text-sm font-medium">{error}</p>
              )}
            </>
          )}

          {successfulCreation && (
            <div className="space-y-3">
              <Label
                htmlFor="password"
                className="text-muted-foreground mb-2 text-sm font-medium"
              >
                {t('forgotPassword.form.newPasswordLabel')}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('forgotPassword.form.passwordPlaceholder')}
              />
              <Label
                htmlFor="code"
                className="text-muted-foreground mb-2 text-sm font-medium"
              >
                {t('forgotPassword.form.codeLabel')}
              </Label>
              <Input
                id="code"
                type="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t('forgotPassword.form.codePlaceholder')}
              />
              <Button disabled={isLoading} className="w-full">
                {t('forgotPassword.form.resetButton')}
              </Button>
              {error && (
                <p className="text-destructive text-sm font-medium">{error}</p>
              )}
            </div>
          )}
        </form>
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            {t('forgotPassword.rememberedPassword')}{' '}
            <Link to={RoutesEnum.LOGIN} className="text-foreground font-medium">
              {t('forgotPassword.signInLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
