import { useSignIn } from '@clerk/clerk-react';
import { Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RoutesEnum } from '@/enums/router';
import { useClerkErrors } from '@/hooks/useClerkErrors';
import { useFormValidation } from '@/lib/formValidation';

export const Login = () => {
  const { t } = useTranslation('auth');
  const { isLoaded, signIn, setActive } = useSignIn();
  const [clerkError, setClerkError] = useState({
    username: '',
    email_address: '',
    password: '',
    verificationCode: '',
    general: '',
  });
  const { processErrors } = useClerkErrors();

  const validationSchema = z.object({
    email: z.email(),
    password: z.string().min(1, 'Password is required'),
  });

  const initialValues = {
    email: '',
    password: '',
  };

  const validateForm = useFormValidation(validationSchema);

  if (!isLoaded) {
    return null;
  }

  const handleSubmit = async (values: z.infer<typeof validationSchema>) => {
    try {
      setClerkError({
        username: '',
        email_address: '',
        password: '',
        verificationCode: '',
        general: '',
      });
      const result = await signIn.create({
        identifier: values.email,
        password: values.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorObj = processErrors(err.errors);
      setClerkError(errorObj);
    }
  };

  return (
    <div className="mt-[140px] flex flex-col items-center">
      <div className="max-w-[507px] space-y-12">
        <div className="space-y-4">
          <h1 className="font-instrument text-center text-[44px] leading-[50px] font-semibold tracking-tight">
            {t('login.title')}
          </h1>
          <div className="flex justify-center">
            <p className="text-muted-foreground max-w-[90%] text-center text-base font-normal">
              {t('login.description')}
            </p>
          </div>
        </div>

        <Formik
          initialValues={initialValues}
          validate={validateForm}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await handleSubmit(values);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            isSubmitting,
          }) => (
            <form
              onSubmit={handleSubmit}
              className="mx-auto w-[386px] space-y-9"
            >
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <Input
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder={t('login.emailPlaceholder')}
                      className="w-full"
                    />
                    {errors.email && touched.email && (
                      <span className="text-destructive text-xs">
                        {errors.email}
                      </span>
                    )}
                    {clerkError.email_address && (
                      <span className="text-destructive text-xs">
                        {clerkError.email_address}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <Input
                      type="password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      placeholder={t('login.passwordPlaceholder')}
                      className="w-full"
                    />
                    {errors.password && touched.password && (
                      <span className="text-destructive text-xs">
                        {errors.password}
                      </span>
                    )}
                    {clerkError.password && (
                      <span className="text-destructive text-xs">
                        {clerkError.password}
                      </span>
                    )}
                    {clerkError.general && (
                      <span className="text-destructive text-xs">
                        {clerkError.general}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-muted-foreground text-sm">
                  {t('login.forgotPassword')}{' '}
                  <Link
                    to={RoutesEnum.FORGOT_PASSWORD}
                    className="text-foreground text-sm font-medium"
                  >
                    {t('login.resetPasswordLink')}
                  </Link>
                </p>
                <div className="bg-border h-[1px] w-full" />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {t('login.loginButton')}
              </Button>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
};
