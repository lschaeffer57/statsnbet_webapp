import type { FormikErrors, FormikTouched } from 'formik';
import { useTranslation } from 'react-i18next';

import type { AuthFormValues } from '@/types';

import { Input } from '../ui/Input';

import CriteriaItem from './CriteriaItem';

interface CriteriaFormProps {
  values: AuthFormValues;
  errors: FormikErrors<AuthFormValues> | undefined;
  touched: FormikTouched<AuthFormValues> | undefined;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFieldValue: (field: string, value: string) => void;
  isLoading?: boolean;
  isNewConfiguration?: boolean;
}

const CriteriaForm = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
  isLoading,
  isNewConfiguration = true,
}: CriteriaFormProps) => {
  const { t } = useTranslation('auth');

  return (
    <div className="space-y-3">
      <CriteriaItem
        isLoading={isLoading}
        name="evMin"
        title={t('signup.performanceParameters.criteria.evMin')}
        placeholder="10.0%"
        value={values.evMin}
        onChange={handleChange}
        setFieldValue={setFieldValue}
        limit={1}
        decimal={true}
        percent={true}
        error={errors?.evMin}
        touched={touched?.evMin}
        isNewConfiguration={isNewConfiguration}
      />
      <CriteriaItem
        isLoading={isLoading}
        name="trj"
        title={t('signup.performanceParameters.criteria.trj')}
        placeholder="10.0%"
        value={values.trj}
        onChange={handleChange}
        setFieldValue={setFieldValue}
        limit={99}
        decimal={true}
        percent={true}
        error={errors?.trj}
        touched={touched?.trj}
        isNewConfiguration={isNewConfiguration}
      />
      <CriteriaItem
        isLoading={isLoading}
        name="minCost"
        title={t('signup.performanceParameters.criteria.minCost')}
        placeholder="10.0"
        value={values.minCost}
        onChange={handleChange}
        setFieldValue={setFieldValue}
        limit={1.3}
        decimal={true}
        error={errors?.minCost}
        touched={touched?.minCost}
        isNewConfiguration={isNewConfiguration}
      />
      <CriteriaItem
        isLoading={isLoading}
        name="maxCost"
        title={t('signup.performanceParameters.criteria.maxCost')}
        placeholder="0"
        value={values.maxCost}
        onChange={handleChange}
        setFieldValue={setFieldValue}
        limit={1.3}
        error={errors?.maxCost}
        touched={touched?.maxCost}
        isNewConfiguration={isNewConfiguration}
      />
      <CriteriaItem
        isLoading={isLoading}
        name="minLiquidity"
        title={t('signup.performanceParameters.criteria.minLiquidity')}
        placeholder="0"
        value={values.minLiquidity}
        onChange={handleChange}
        setFieldValue={setFieldValue}
        limit={500}
        error={errors?.minLiquidity}
        touched={touched?.minLiquidity}
        isNewConfiguration={isNewConfiguration}
      />
      <CriteriaItem
        isLoading={isLoading}
        name="bankroll"
        title={t('signup.performanceParameters.criteria.bankroll')}
        placeholder="0"
        value={values.bankroll}
        onChange={handleChange}
        setFieldValue={setFieldValue}
        error={errors?.bankroll}
        touched={touched?.bankroll}
        isNewConfiguration={isNewConfiguration}
      />
      <div className="flex w-full items-center justify-between">
        <span className="text-foreground/50 text-sm font-normal">
          {t('signup.performanceParameters.criteria.betTime')}
        </span>
        <div className="flex items-center gap-2">
          <Input
            isLoading={isLoading}
            skeletonClassName="h-[32px] w-[62px]"
            disabled={!isNewConfiguration}
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
            isLoading={isLoading}
            skeletonClassName="h-[32px] w-[62px]"
            disabled={!isNewConfiguration}
            type="time"
            name="time.end"
            className="!bg-input h-[32px] w-[62px] px-2 py-1.5 placeholder:-tracking-[.04em]"
            value={values.time.end}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="border-border-dashed mt-1 w-full border-b border-dashed" />
    </div>
  );
};

export default CriteriaForm;
