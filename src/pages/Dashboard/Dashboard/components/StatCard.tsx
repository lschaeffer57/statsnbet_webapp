import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

const StatCard = ({
  title,
  value,
  isLoading,
}: {
  title: string;
  value: string | number;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <Card className="from-input gap-3 bg-gradient-to-b to-transparent p-5">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </Card>
    );
  }
  return (
    <Card className="from-input gap-3 bg-gradient-to-b to-transparent p-5">
      <p className="text-foreground/50 text-sm leading-5">{title}</p>
      <span className="text-foreground text-xl leading-[23px] font-medium">
        {value}
      </span>
    </Card>
  );
};

export default StatCard;
