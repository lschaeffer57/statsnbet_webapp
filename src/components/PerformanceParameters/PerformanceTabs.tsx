import { useQuery } from '@tanstack/react-query';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { bookmakersApi } from '@/api/bookmakersApi';
import { useFormValidation } from '@/lib/formValidation';
import type { AuthFormValues } from '@/types';

import { Button } from '../ui/Button';
import { Tabs, TabsTrigger, TabsList, TabsContent } from '../ui/Tabs';

import CriteriaForm from './CriteriaForm';
import TypeForm from './TypeForm';

const PerformanceTabs = ({
  setPerformanceParameters,
  performanceParameters,
  isLoading,
}: {
  setPerformanceParameters: (data: AuthFormValues) => void;
  performanceParameters: AuthFormValues;
  isLoading?: boolean;
}) => {
  const { t } = useTranslation('auth');

  const { data: bookmakers } = useQuery(
    bookmakersApi.getBookmakersQueryOptions(),
  );

  const validatePercentage = (val: string) => {
    const num = parseFloat(val.replace('%', ''));
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  const validatePositiveNumber = (val: string) => {
    const num = parseFloat(val.replace('%', ''));
    return !isNaN(num) && num >= 0;
  };

  const validationSchema = z.object({
    betType: z
      .object({
        live: z.boolean(),
        prematch: z.boolean(),
      })
      .refine(
        (data) => {
          return Object.values(data).some((value) => value);
        },
        {
          message: t(
            'signup.performanceParameters.validation.selectAtLeastOne',
          ),
        },
      ),
    sport: z
      .array(z.string())
      .min(1, t('signup.performanceParameters.validation.selectAtLeastOne')),
    betIn: z
      .array(z.string())
      .min(1, t('signup.performanceParameters.validation.selectAtLeastOne')),
    market: z
      .object({
        moneyline: z.boolean(),
        over_under: z.boolean(),
        handicap: z.boolean(),
        player_performance: z.boolean(),
      })
      .refine(
        (data) => {
          return Object.values(data).some((value) => value);
        },
        {
          message: t(
            'signup.performanceParameters.validation.selectAtLeastOne',
          ),
        },
      ),
    bookmaker: z
      .array(z.string())
      .min(1, t('signup.performanceParameters.validation.selectAtLeastOne')),

    evMin: z.string().refine(validatePercentage, {
      message: t('signup.performanceParameters.validation.percentageRange'),
    }),
    trj: z.string().refine(validatePercentage, {
      message: t('signup.performanceParameters.validation.percentageRange'),
    }),
    minCost: z.string().refine(validatePositiveNumber, {
      message: t('signup.performanceParameters.validation.positiveNumber'),
    }),
    maxCost: z.string().refine(validatePositiveNumber, {
      message: t('signup.performanceParameters.validation.positiveNumber'),
    }),
    minLiquidity: z.string().refine(validatePositiveNumber, {
      message: t('signup.performanceParameters.validation.positiveNumber'),
    }),
    bankroll: z.string().refine(validatePositiveNumber, {
      message: t('signup.performanceParameters.validation.positiveNumber'),
    }),
    time: z.object({
      start: z.string(),
      end: z.string(),
    }),
  });

  const validateForm = useFormValidation(validationSchema);

  return (
    <Tabs defaultValue="criteria" className="w-full gap-5">
      <TabsList className="w-full">
        <TabsTrigger value="criteria">
          {t('signup.performanceParameters.tabs.criteria')}
        </TabsTrigger>
        <TabsTrigger value="type">
          {t('signup.performanceParameters.tabs.betType')}
        </TabsTrigger>
      </TabsList>
      <div className="border-border-dashed mt-1 w-full border-b border-dashed" />
      <Formik
        initialValues={performanceParameters}
        enableReinitialize={true}
        validate={validateForm}
        onSubmit={(values, { setSubmitting }) => {
          setPerformanceParameters(values);
          setSubmitting(false);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setFieldValue,
          isSubmitting,
        }) => {
          return (
            <div>
              <TabsContent className="text-foreground" value="criteria">
                <CriteriaForm
                  isLoading={isLoading}
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  setFieldValue={setFieldValue}
                />
              </TabsContent>
              <TabsContent className="text-foreground" value="type">
                <TypeForm
                  bookmakers={bookmakers}
                  values={values}
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  isLoading={isLoading}
                />
              </TabsContent>
              <Button
                type="button"
                onClick={() => handleSubmit()}
                className="mt-9 h-8 w-full"
                disabled={isSubmitting}
              >
                {t('signup.performanceParameters.criteria.saveButton')}
              </Button>
            </div>
          );
        }}
      </Formik>
    </Tabs>
  );
};

export default PerformanceTabs;
