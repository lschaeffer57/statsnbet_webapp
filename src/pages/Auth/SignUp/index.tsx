import { useSignUp } from '@clerk/clerk-react';
import { useMutation } from '@tanstack/react-query';
import { Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { z } from 'zod';

import { userApi } from '@/api/userApi';
import { PerformanceParameters } from '@/components/PerformanceParameters';
import TelegramConnect from '@/components/TelegramConnect';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { DEFAULT_PERFORMANCE_PARAMETERS } from '@/constants';
import { useClerkErrors } from '@/hooks/useClerkErrors';
import { useFormValidation } from '@/lib/formValidation';
import type { AuthFormValues, TelegramUser } from '@/types';

export const SignUp = () => {
  const [clerkError, setClerkError] = useState({
    username: '',
    email_address: '',
    password: '',
    verificationCode: '',
    general: '',
  });
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [performanceParameters, setPerformanceParameters] =
    useState<AuthFormValues>(DEFAULT_PERFORMANCE_PARAMETERS);
  const [telegram, setTelegram] = useState<TelegramUser | undefined>(undefined);
  const [criteriaSaved, setCriteriaSaved] = useState(false);
  const { isLoaded, setActive, signUp } = useSignUp();
  const { t } = useTranslation('auth');
  const { processErrors } = useClerkErrors();

  const [searchParams] = useSearchParams();
  const invitationTicket = searchParams.get('__clerk_ticket');

  const validationSchema = z.object({
    name: z.string().min(1, t('signup.validation.nameRequired')),
    email: z.email(),
    password: z.string().min(8, t('signup.validation.passwordMinLength')),
  });

  const initialValues = {
    name: '',
    email: '',
    password: '',
  };

  const validateForm = useFormValidation(validationSchema);

  const createUserMutation = useMutation({
    mutationFn: userApi.createUser,
    onError: (error) => {
      console.error(error);
    },
  });

  if (!isLoaded) {
    return (
      <div className="bg-background flex h-full items-center justify-center">
        <Spinner className="h-[50px] w-[50px]" />
      </div>
    );
  }

  const handleSubmit = async (values: z.infer<typeof validationSchema>) => {
    setClerkError({
      username: '',
      email_address: '',
      password: '',
      verificationCode: '',
      general: '',
    });
    if (!telegram) return;
    try {
      const result = await signUp.create({
        username: values.name,
        emailAddress: values.email,
        password: values.password,
        ...(invitationTicket && { ticket: invitationTicket }),
      });

      if (result.status === 'missing_requirements') {
        await signUp.prepareEmailAddressVerification({
          strategy: 'email_code',
        });
        setShowCodeInput(true);
      }

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });

        createUserMutation.mutate({
          clerkId: result.createdUserId!,
          email: values.email,
          username: values.name,
          performanceParameters,
          telegram,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorObj = processErrors(err.errors);
      setClerkError(errorObj);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClerkError({
      username: '',
      email_address: '',
      password: '',
      verificationCode: '',
      general: '',
    });
    try {
      const verification = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (verification.status === 'complete') {
        await setActive({ session: verification.createdSessionId });
        createUserMutation.mutate({
          clerkId: verification.createdUserId!,
          email: verification.emailAddress!,
          username: verification.username!,
          performanceParameters,
          telegram,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorObj = processErrors(err.errors);
      setClerkError(errorObj);
    }
  };

  return (
    <div className="mt-[140px] flex flex-col items-center">
      <div className="max-w-[540px] space-y-12">
        <div className="space-y-4">
          <h1 className="font-instrument text-center text-[44px] leading-[50px] font-semibold tracking-tight">
            {t('signup.title')}
          </h1>
          <div className="flex justify-center">
            <p className="text-muted-foreground max-w-[80%] text-center text-base font-normal">
              {t('signup.description')}
            </p>
          </div>
        </div>
        {showCodeInput ? (
          <form onSubmit={handleCodeSubmit} className="space-y-6">
            <div className="space-y-0.5">
              <Input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder={t('signup.form.verificationCodePlaceholder')}
              />
              {clerkError && (
                <span className="text-destructive text-xs">
                  {clerkError.verificationCode}
                </span>
              )}
            </div>
            <Button
              className="w-full"
              disabled={createUserMutation.isPending}
              type="submit"
            >
              {t('signup.createAccountButton')}
            </Button>
          </form>
        ) : (
          <Formik
            initialValues={initialValues}
            validate={validateForm}
            onSubmit={async (values, { setSubmitting }) => {
              setSubmitAttempted(true);

              if (!performanceParameters.bankroll.trim()) {
                setSubmitting(false);
                return;
              }

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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <Input
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      placeholder={t('signup.form.namePlaceholder')}
                      className="w-full"
                    />
                    {errors.name && touched.name && (
                      <span className="text-destructive text-xs">
                        {errors.name}
                      </span>
                    )}
                    {clerkError.username && (
                      <span className="text-destructive text-xs">
                        {clerkError.username}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <Input
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder={t('signup.form.emailPlaceholder')}
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
                      placeholder={t('signup.form.passwordPlaceholder')}
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
                  </div>
                </div>
                <div className="bg-input h-[1px] w-full" />
                <div className="space-y-0.5">
                  <PerformanceParameters
                    showConfiguration={false}
                    setPerformanceParameters={(params) => {
                      setPerformanceParameters(params);
                      setCriteriaSaved(true);
                    }}
                    performanceParameters={performanceParameters}
                  />
                  {!performanceParameters.bankroll.trim() &&
                    submitAttempted && (
                      <span className="text-destructive text-xs">
                        {t('signup.validation.fillAllCriteria')}
                      </span>
                    )}
                </div>
                {criteriaSaved && (
                  <>
                    <TelegramConnect
                      onDelete={() => setTelegram(undefined)}
                      onConnect={setTelegram}
                      telegramData={telegram}
                    />
                    {!telegram && submitAttempted && (
                      <span className="text-destructive text-xs">
                        {t('signup.validation.telegramConnect')}
                      </span>
                    )}
                  </>
                )}
                {clerkError.general && (
                  <span className="text-destructive block text-xs">
                    {clerkError.general}
                  </span>
                )}
                <div className="bg-input h-[1px] w-full" />
                <Button
                  className="w-full"
                  disabled={isSubmitting || createUserMutation.isPending}
                  type="submit"
                >
                  {t('signup.createAccountButton')}
                </Button>
              </form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};
