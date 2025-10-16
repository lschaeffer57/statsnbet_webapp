import type { UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/SearchInput';
import {
  Pagination,
  PaginationEllipsis,
  PaginationNext,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
} from '@/components/ui/Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import SkeletonRow from '@/pages/Dashboard/components/SkeletonRow';
import type { BetsApiResponse } from '@/types';

interface BetsTableProps {
  tableData:
    | UseQueryResult<BetsApiResponse, Error>
    | {
        data: BetsApiResponse | undefined;
        isLoading: boolean;
        isRefetching?: boolean;
      };
  setSearch: (search: string) => void;
  search: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const BetsTable = ({
  tableData,
  setSearch,
  search,
  currentPage,
  setCurrentPage,
}: BetsTableProps) => {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const { data, isLoading, isRefetching } = tableData;

  const tableDatas = useMemo(() => {
    return data?.data ?? [];
  }, [data?.data]);

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="mt-20 space-y-6 px-7">
      <DebounceInput
        minLength={2}
        debounceTimeout={300}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        element={SearchInput}
      />
      <Table>
        <TableHeader className="!border-b-0">
          <TableRow className="bg-input !border-b-0">
            <TableHead className="text-foreground/50 rounded-l-2xl px-4 py-[7px]">
              {t('table.headers.match')}
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              {t('table.headers.bet')}
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              {t('table.headers.odds')}
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              {t('table.headers.stake')}
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              {t('table.headers.result')}
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              {t('table.headers.date')}
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              {t('table.headers.fairOdd')}
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              {t('table.headers.ev')}
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              {t('table.headers.liquidity')}
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              {t('table.headers.payoutRate')}
            </TableHead>
            <TableHead className="text-foreground/50 px-4 py-[7px]">
              {t('table.headers.configuration')}
            </TableHead>
            <TableHead className="text-foreground/50 rounded-r-2xl px-4 py-[7px]">
              {t('table.headers.bookmakers')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading && !isRefetching ? (
            tableDatas.map((item) => (
              <TableRow key={item._id} className="border-b-0">
                <TableCell className="min-w-[200px] border-r px-4 py-2.5 whitespace-normal">
                  {item.match}
                </TableCell>
                <TableCell className="min-w-[200px] border-r px-4 py-2.5 whitespace-normal">
                  {typeof item.bet === 'string'
                    ? item.bet
                    : item.bet?.competition}
                </TableCell>
                <TableCell className="min-w-[90px] border-r px-4 py-2.5">
                  {item.odds?.toFixed(2) ?? '--'}
                </TableCell>
                <TableCell className="min-w-[90px] border-r px-4 py-2.5">
                  {item.stake ?? '--'}
                </TableCell>
                <TableCell className="min-w-[90px] border-r px-4 py-2.5">
                  {item.result === null
                    ? t('table.result.inProgress')
                    : item.result}
                </TableCell>
                <TableCell className="min-w-[110px] border-r px-4 py-2.5">
                  {item.date}
                </TableCell>
                <TableCell className="min-w-[90px] border-r px-4 py-2.5">
                  {item.fair_odds?.toFixed(2) ?? '--'}
                </TableCell>
                <TableCell className="min-w-[90px] border-r px-4 py-2.5">
                  {item.ev?.toFixed(1) ?? '--'}%
                </TableCell>
                <TableCell className="min-w-[90px] border-r px-4 py-2.5">
                  {item.liquidity ?? '--'}
                </TableCell>
                <TableCell className="min-w-[120px] border-r px-4 py-2.5">
                  {item.payout_rate?.toFixed(2) ?? '--'}%
                </TableCell>
                <TableCell className="min-w-[120px] border-r px-4 py-2.5">
                  2
                </TableCell>
                <TableCell className="min-w-[120px] px-4 py-2.5">
                  {item.bookmaker}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          )}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                to="#"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                }
                text={tCommon('pagination.previous')}
              />
            </PaginationItem>
            {generatePageNumbers().map((page, index) => (
              <PaginationItem key={index}>
                {page === '...' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    to="#"
                    onClick={() => setCurrentPage(page as number)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                to="#"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
                text={tCommon('pagination.next')}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default BetsTable;
