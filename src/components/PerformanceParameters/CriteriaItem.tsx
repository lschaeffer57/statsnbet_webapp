import { MinusIcon, PlusIcon } from '@/assets/icons';
import { cn } from '@/lib/utils';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface CriteriaItemProps {
  name: string;
  title: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFieldValue?: (field: string, value: string) => void;
  limit?: number;
  decimal?: boolean;
  percent?: boolean;
  error?: string | undefined;
  touched?: boolean | undefined;
  isLoading?: boolean;
}

const CriteriaItem = ({
  isLoading,
  name,
  title,
  placeholder,
  value,
  onChange,
  setFieldValue,
  limit,
  decimal = false,
  percent = false,
  error,
  touched,
}: CriteriaItemProps) => {
  const handleIncrement = () => {
    if (!setFieldValue) return;
    const currentValue = parseFloat(value.replace('%', '')) || 0;
    const increment = decimal ? 0.1 : 1;
    const result = (currentValue + increment)
      .toFixed(decimal ? 1 : 0)
      .toString();
    const newValue = percent ? `${result}%` : result;

    if (percent && parseFloat(result) > 100) return;

    setFieldValue(name, newValue);
  };

  const handleDecrement = () => {
    if (!setFieldValue) return;
    const currentValue = parseFloat(value.replace('%', '')) || 0;
    const decrement = decimal ? 0.1 : 1;
    const result = Math.max(0, currentValue - decrement)
      .toFixed(decimal ? 1 : 0)
      .toString();
    if (limit && parseFloat(result) < limit) {
      setFieldValue(name, percent ? `${limit}%` : limit.toString());
    } else {
      setFieldValue(name, percent ? `${result}%` : result);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    const regex = percent ? /^[0-9]*\.?[0-9]*%?$/ : /^[0-9]*\.?[0-9]*$/;

    if (regex.test(inputValue) || inputValue === '') {
      onChange(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (!value) return;

    const numValue = parseFloat(value);

    if (limit !== undefined && numValue < limit) {
      value = limit.toString();
    }

    if (percent && !value.includes('%')) {
      value = value + '%';
    }

    e.target.value = value;
    onChange(e);
  };

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex w-full items-center justify-between">
        <span className="text-foreground/50 text-sm font-normal">{title}</span>
        <div className="flex items-center gap-0.5">
          <Input
            isLoading={isLoading}
            skeletonClassName="h-[32px] w-[54px]"
            name={name}
            placeholder={placeholder}
            className={cn(
              '!bg-input h-[32px] w-[54px] px-2 py-1.5 placeholder:-tracking-[.04em]',
              error && touched && '!border-destructive',
            )}
            value={value}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          <div className="flex flex-col">
            <Button
              variant="secondary"
              type="button"
              className="!bg-input -mb-[1px] h-[16px] rounded-md rounded-b-none !px-[4.5px] !py-0.5 !shadow-none"
              onClick={handleIncrement}
              disabled={isLoading}
            >
              <PlusIcon className="size-3" />
            </Button>
            <Button
              variant="secondary"
              type="button"
              className="!bg-input -mt-[1px] h-[16px] rounded-md rounded-t-none !px-[4.5px] !py-0.5 !shadow-none"
              onClick={handleDecrement}
              disabled={
                isLoading ||
                (typeof limit === 'number' &&
                  parseFloat(value.replace('%', '')) <= limit)
              }
            >
              <MinusIcon className="size-3" />
            </Button>
          </div>
        </div>
      </div>
      {error && touched && (
        <span className="text-destructive text-xs">{error}</span>
      )}
    </div>
  );
};

export default CriteriaItem;
