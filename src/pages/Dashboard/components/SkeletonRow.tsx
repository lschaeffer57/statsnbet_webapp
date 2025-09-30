import { Skeleton } from '@/components/ui/Skeleton';
import { TableCell, TableRow } from '@/components/ui/Table';

const SkeletonRow = ({ colSpan = 10 }: { colSpan?: number }) => {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-9 w-full" />
      </TableCell>
      <TableCell colSpan={colSpan}>
        <Skeleton className="h-9 w-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-9 w-full" />
      </TableCell>
    </TableRow>
  );
};

export default SkeletonRow;
