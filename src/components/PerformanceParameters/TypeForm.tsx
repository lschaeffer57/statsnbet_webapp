import { type FormikTouched, type FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';

import { ChevronDownIcon } from '@/assets/icons';
import type { BookmakerI, AuthFormValues } from '@/types';

import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '../ui/DropdownMenu';
import { Label } from '../ui/Label';

interface TypeFormProps {
  bookmakers: BookmakerI[] | undefined;
  values: AuthFormValues;
  errors: FormikErrors<AuthFormValues> | undefined;
  touched: FormikTouched<AuthFormValues> | undefined;
  setFieldValue: (field: string, value: string | string[] | object) => void;
  isLoading?: boolean;
}

const TypeForm = ({
  bookmakers,
  values,
  errors,
  touched,
  setFieldValue,
  isLoading,
}: TypeFormProps) => {
  const { t } = useTranslation('auth');

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-foreground/50 text-sm font-normal">
            {t('signup.performanceParameters.type.types.title')}
          </span>
          <div className="flex items-center gap-5">
            <Label>
              <Checkbox
                isLoading={isLoading}
                checked={values.betType.live}
                onCheckedChange={(checked) => {
                  return checked
                    ? setFieldValue('betType', {
                        ...values.betType,
                        live: true,
                      })
                    : setFieldValue('betType', {
                        ...values.betType,
                        live: false,
                      });
                }}
              />
              {t('signup.performanceParameters.type.types.live')}
            </Label>
            <Label>
              <Checkbox
                isLoading={isLoading}
                checked={values.betType.prematch}
                onCheckedChange={(checked) => {
                  return checked
                    ? setFieldValue('betType', {
                        ...values.betType,
                        prematch: true,
                      })
                    : setFieldValue('betType', {
                        ...values.betType,
                        prematch: false,
                      });
                }}
              />
              {t('signup.performanceParameters.type.types.prematch')}
            </Label>
          </div>
        </div>
        {errors?.betType && touched?.betType && (
          <span className="text-destructive text-xs">
            {typeof errors.betType === 'string'
              ? errors.betType
              : errors.betType.live || errors.betType.prematch}
          </span>
        )}
      </div>

      <div className="space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-foreground/50 text-sm font-normal">
            {t('signup.performanceParameters.type.sport.title')}
          </span>
          <div className="flex items-center gap-5">
            <Label>
              <Checkbox
                isLoading={isLoading}
                checked={values.sport.includes('Football')}
                onCheckedChange={(checked) => {
                  return checked
                    ? setFieldValue('sport', [...values.sport, 'Football'])
                    : setFieldValue(
                        'sport',
                        values.sport.filter((item) => item !== 'Football'),
                      );
                }}
              />
              {t('signup.performanceParameters.type.sport.football')}
            </Label>
            <Label>
              <Checkbox
                isLoading={isLoading}
                checked={values.sport.includes('Tennis')}
                onCheckedChange={(checked) => {
                  return checked
                    ? setFieldValue('sport', [...values.sport, 'Tennis'])
                    : setFieldValue(
                        'sport',
                        values.sport.filter((item) => item !== 'Tennis'),
                      );
                }}
              />
              {t('signup.performanceParameters.type.sport.tennis')}
            </Label>
            <Label>
              <Checkbox
                isLoading={isLoading}
                checked={values.sport.includes('Basketball')}
                onCheckedChange={(checked) => {
                  return checked
                    ? setFieldValue('sport', [...values.sport, 'Basketball'])
                    : setFieldValue(
                        'sport',
                        values.sport.filter((item) => item !== 'Basketball'),
                      );
                }}
              />
              {t('signup.performanceParameters.type.sport.basketball')}
            </Label>
          </div>
        </div>
        {errors?.sport && touched?.sport && (
          <span className="text-destructive text-xs">{errors.sport}</span>
        )}
      </div>

      <div className="space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-foreground/50 text-sm font-normal">
            {t('signup.performanceParameters.type.betIn.title')}
          </span>
          <div className="flex items-center gap-5">
            <Label>
              <Checkbox
                isLoading={isLoading}
                checked={values.betIn.includes('euro')}
                onCheckedChange={(checked) => {
                  return checked
                    ? setFieldValue('betIn', [...values.betIn, 'euro'])
                    : setFieldValue(
                        'betIn',
                        values.betIn.filter((item) => item !== 'euro'),
                      );
                }}
              />
              {t('signup.performanceParameters.type.betIn.euro')}
            </Label>
            <Label>
              <Checkbox
                isLoading={isLoading}
                checked={values.betIn.includes('pct')}
                onCheckedChange={(checked) => {
                  return checked
                    ? setFieldValue('betIn', [...values.betIn, 'pct'])
                    : setFieldValue(
                        'betIn',
                        values.betIn.filter((item) => item !== 'pct'),
                      );
                }}
              />
              {t('signup.performanceParameters.type.betIn.percentage')}
            </Label>
          </div>
        </div>
        {errors?.betIn && touched?.betIn && (
          <span className="text-destructive text-xs">{errors.betIn}</span>
        )}
      </div>

      <div className="space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-foreground/50 text-sm font-normal">
            {t('signup.performanceParameters.type.market.title')}
          </span>
          <div className="flex max-w-2/3 flex-wrap items-center justify-end gap-5">
            <Label>
              <Checkbox
                isLoading={isLoading}
                checked={values.market.moneyline}
                onCheckedChange={(checked) => {
                  return checked
                    ? setFieldValue('market', {
                        ...values.market,
                        moneyline: true,
                      })
                    : setFieldValue('market', {
                        ...values.market,
                        moneyline: false,
                      });
                }}
              />
              {t('signup.performanceParameters.type.market.moneyline')}
            </Label>
            <Label>
              <Checkbox
                isLoading={isLoading}
                checked={values.market.over_under}
                onCheckedChange={(checked) => {
                  return checked
                    ? setFieldValue('market', {
                        ...values.market,
                        over_under: true,
                      })
                    : setFieldValue('market', {
                        ...values.market,
                        over_under: false,
                      });
                }}
              />
              {t('signup.performanceParameters.type.market.overunder')}
            </Label>
            <Label>
              <Checkbox
                isLoading={isLoading}
                checked={values.market.handicap}
                onCheckedChange={(checked) => {
                  return checked
                    ? setFieldValue('market', {
                        ...values.market,
                        handicap: true,
                      })
                    : setFieldValue('market', {
                        ...values.market,
                        handicap: false,
                      });
                }}
              />
              {t('signup.performanceParameters.type.market.handicap')}
            </Label>
            <Label>
              <Checkbox
                isLoading={isLoading}
                checked={values.market.player_performance}
                onCheckedChange={(checked) => {
                  return checked
                    ? setFieldValue('market', {
                        ...values.market,
                        player_performance: true,
                      })
                    : setFieldValue('market', {
                        ...values.market,
                        player_performance: false,
                      });
                }}
              />
              {t('signup.performanceParameters.type.market.performance')}
            </Label>
          </div>
        </div>
        {errors?.market && touched?.market && (
          <span className="text-destructive text-xs">
            {typeof errors.market === 'string'
              ? errors.market
              : errors.market.moneyline ||
                errors.market.over_under ||
                errors.market.handicap ||
                errors.market.player_performance}
          </span>
        )}
      </div>

      <div className="space-y-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="from-muted w-full !bg-gradient-to-b to-transparent py-1.5 pr-2.5 pl-2 opacity-100"
              size="sm"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-foreground/50">
                    {t('signup.performanceParameters.type.bookmaker.title')}
                    <span className="text-foreground/25">
                      {t(
                        'signup.performanceParameters.type.bookmaker.maxLimit',
                      )}
                    </span>
                  </span>
                  <span className="text-foreground">
                    {values.bookmaker.join(', ')}
                  </span>
                </div>
                <ChevronDownIcon className="size-[14px]" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[400px]">
            {bookmakers?.map((bookmaker) => (
              <DropdownMenuCheckboxItem
                className="w-full"
                disabled={
                  (values.bookmaker.length >= 3 &&
                    !values.bookmaker.includes(
                      bookmaker.cloneName.toLowerCase(),
                    )) ||
                  !bookmaker.running
                }
                key={bookmaker.cloneName}
                checked={values.bookmaker.includes(
                  bookmaker.cloneName.toLowerCase(),
                )}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={(checked) => {
                  return checked
                    ? setFieldValue('bookmaker', [
                        ...values.bookmaker,
                        bookmaker.cloneName.toLowerCase(),
                      ])
                    : setFieldValue(
                        'bookmaker',
                        values.bookmaker.filter(
                          (item) => item !== bookmaker.cloneName.toLowerCase(),
                        ),
                      );
                }}
              >
                <div className="flex w-full items-center justify-between">
                  <span>{bookmaker.cloneName}</span>
                  <span className="text-foreground/50">
                    (+{bookmaker.users}{' '}
                    {t('signup.performanceParameters.type.bookmaker.users')})
                  </span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {errors?.bookmaker && touched?.bookmaker && (
          <span className="text-destructive text-xs">{errors.bookmaker}</span>
        )}
      </div>
      <div className="border-border-dashed mt-1 w-full border-b border-dashed" />
    </div>
  );
};

export default TypeForm;
