import type { InfiniteData } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { useIntersection } from '@/hooks/useIntersection';
import type { BetsApiResponse } from '@/types/dashboard';

import SkeletonRow from './SkeletonRow';

interface BetsTableProps {
  data: InfiniteData<BetsApiResponse, unknown> | undefined;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}

const BetsTable = ({
  data,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: BetsTableProps) => {
  const tableData = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data?.pages]);

  const cursorRef = useIntersection(() => {
    fetchNextPage();
  });
  return (
    <div className="mt-20 px-7">
      <Table>
        <TableHeader className="!border-b-0">
          <TableRow className="bg-input !border-b-0">
            <TableHead className="text-foreground/50 rounded-l-2xl px-4 py-[7px]">
              Match
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              Pari
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              Côte
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              Mise
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              Résultat
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              Date
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              Fair odd
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              EV
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              Liquidité
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              Payout Rate
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              Configuration
            </TableHead>
            <TableHead className="text-foreground/50 rounded-r-2xl px-4 py-[7px]">
              Bookmakers
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((item) => (
            <TableRow key={item._id} className="border-b-0">
              <TableCell className="min-w-[200px] border-r px-4 py-2.5 whitespace-normal">
                {item.match}
              </TableCell>
              <TableCell className="min-w-[200px] border-r px-4 py-2.5 whitespace-normal">
                {item.bet}
              </TableCell>
              <TableCell className="min-w-[90px] border-r px-4 py-2.5">
                2
              </TableCell>
              <TableCell className="min-w-[90px] border-r px-4 py-2.5">
                10
              </TableCell>
              <TableCell className="min-w-[90px] border-r px-4 py-2.5">
                {item.result === null ? 'En cours' : item.result}
              </TableCell>
              <TableCell className="min-w-[110px] border-r px-4 py-2.5">
                {item.date}
              </TableCell>
              <TableCell className="min-w-[90px] border-r px-4 py-2.5">
                {item.fair_odds.toFixed(2)}
              </TableCell>
              <TableCell className="min-w-[90px] border-r px-4 py-2.5">
                {item.ev.toFixed(1)}%
              </TableCell>
              <TableCell className="min-w-[90px] border-r px-4 py-2.5">
                {item.liquidity}
              </TableCell>
              <TableCell className="min-w-[120px] border-r px-4 py-2.5">
                {item.payout_rate.toFixed(2)}%
              </TableCell>
              <TableCell className="min-w-[120px] border-r px-4 py-2.5">
                2
              </TableCell>
              <TableCell className="min-w-[120px] px-4 py-2.5">
                {item.bookmaker}
              </TableCell>
            </TableRow>
          ))}
          {!isLoading && !isFetchingNextPage && (
            <TableRow ref={cursorRef}></TableRow>
          )}
          {isLoading && (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          )}
          {isFetchingNextPage && <SkeletonRow />}
          {!hasNextPage && !isLoading && !isFetchingNextPage && (
            <TableRow className="bg-sidebar">
              <TableCell colSpan={12} className="px-4 py-3">
                All data is displayed
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BetsTable;
