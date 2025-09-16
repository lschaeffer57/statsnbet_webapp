import { Card } from '@/components/ui/Card';

const StatCard = ({ title, value }: { title: string; value: string }) => {
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
