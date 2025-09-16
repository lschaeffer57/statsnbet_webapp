import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { cn } from '@/lib/utils';

export function DatePicker({
  date,
  setDate,
  className,
}: {
  date: Date | undefined;
  setDate: (value: Date | undefined) => void;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          data-empty={!date}
          className={cn(
            'data-[empty=true]:text-foreground !shadow-glass from-input justify-start !bg-gradient-to-b to-transparent text-left font-normal opacity-100',
            className,
          )}
        >
          <CalendarIcon className="size-[14px]" />
          {date ? format(date, 'dd/MM') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          showOutsideDays={false}
          mode="single"
          selected={date}
          onSelect={setDate}
        />
      </PopoverContent>
    </Popover>
  );
}
