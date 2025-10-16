import { queryOptions } from '@tanstack/react-query';

import { jsonApiInstance } from '@/lib/apiInstance';
import type { Course } from '@/types';

export const courseApi = {
  baseKey: 'course',
  getCoursesQueryOptions: () => {
    return queryOptions({
      queryKey: [courseApi.baseKey],
      queryFn: () => jsonApiInstance<Course[]>(`course`),
    });
  },
};
