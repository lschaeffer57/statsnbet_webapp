import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

import CriteriaItem from './CriteriaItem';

const CriteriaForm = () => {
  const { t } = useTranslation('auth');

  const validatePercentage = (val: string) => {
    const num = parseFloat(val.replace('%', ''));
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  const validatePositiveNumber = (val: string) => {
    const num = parseFloat(val.replace('%', ''));
    return !isNaN(num) && num >= 0;
  };

  const validationSchema = z.object({
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

  const initialValues = {
    evMin: '',
    trj: '',
    minCost: '',
    maxCost: '',
    minLiquidity: '',
    bankroll: '',
    time: {
      start: '00:00',
      end: '00:00',
    },
  };

  const validateForm = (values: typeof initialValues) => {
    try {
      validationSchema.parse(values);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        return errors;
      }
      return {};
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={validateForm}
      onSubmit={(values, { setSubmitting }) => {
        console.log(values);
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
      }) => (
        <form onSubmit={handleSubmit} className="space-y-3">
          <CriteriaItem
            name="evMin"
            title={t('signup.performanceParameters.criteria.evMin')}
            placeholder="10.0%"
            value={values.evMin}
            onChange={handleChange}
            setFieldValue={setFieldValue}
            decimal={true}
            percent={true}
            error={errors.evMin}
            touched={touched.evMin}
          />
          <CriteriaItem
            name="trj"
            title={t('signup.performanceParameters.criteria.trj')}
            placeholder="10.0%"
            value={values.trj}
            onChange={handleChange}
            setFieldValue={setFieldValue}
            decimal={true}
            percent={true}
            error={errors.trj}
            touched={touched.trj}
          />
          <CriteriaItem
            name="minCost"
            title={t('signup.performanceParameters.criteria.minCost')}
            placeholder="10.0"
            value={values.minCost}
            onChange={handleChange}
            setFieldValue={setFieldValue}
            decimal={true}
            error={errors.minCost}
            touched={touched.minCost}
          />
          <CriteriaItem
            name="maxCost"
            title={t('signup.performanceParameters.criteria.maxCost')}
            placeholder="0"
            value={values.maxCost}
            onChange={handleChange}
            setFieldValue={setFieldValue}
            error={errors.maxCost}
            touched={touched.maxCost}
          />
          <CriteriaItem
            name="minLiquidity"
            title={t('signup.performanceParameters.criteria.minLiquidity')}
            placeholder="0"
            value={values.minLiquidity}
            onChange={handleChange}
            setFieldValue={setFieldValue}
            error={errors.minLiquidity}
            touched={touched.minLiquidity}
          />
          <CriteriaItem
            name="bankroll"
            title={t('signup.performanceParameters.criteria.bankroll')}
            placeholder="0"
            value={values.bankroll}
            onChange={handleChange}
            setFieldValue={setFieldValue}
            error={errors.bankroll}
            touched={touched.bankroll}
          />
          <div className="flex w-full items-center justify-between">
            <span className="text-foreground/50 text-sm font-normal">
              {t('signup.performanceParameters.criteria.betTime')}
            </span>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                name="time.start"
                className="!bg-input h-[32px] w-[62px] px-2 py-1.5 placeholder:-tracking-[.04em]"
                value={values.time.start}
                onChange={handleChange}
              />
              <span className="text-foreground/50 block text-xs font-normal">
                {t('signup.performanceParameters.criteria.betTimeFrom')}
              </span>
              <Input
                type="time"
                name="time.end"
                className="!bg-input h-[32px] w-[62px] px-2 py-1.5 placeholder:-tracking-[.04em]"
                value={values.time.end}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="border-border-dashed mt-1 w-full border-b border-dashed" />
          <Button type="submit" className="h-8 w-full" disabled={isSubmitting}>
            {t('signup.performanceParameters.criteria.saveButton')}
          </Button>
        </form>
      )}
    </Formik>
  );
};

export default CriteriaForm;
