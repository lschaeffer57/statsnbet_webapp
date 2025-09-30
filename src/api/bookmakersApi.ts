import { queryOptions } from '@tanstack/react-query';

import { jsonApiInstance } from '@/lib/apiInstance';
import type { BookmakerI } from '@/types';

export const bookmakersApi = {
  baseKey: 'bookmakers',
  getBookmakersQueryOptions: () => {
    return queryOptions({
      queryKey: [bookmakersApi.baseKey],
      queryFn: () => jsonApiInstance<BookmakerI[]>(`bookmakers`),
    });
  },
};
