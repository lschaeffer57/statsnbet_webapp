import { queryOptions } from '@tanstack/react-query';

import { jsonApiInstance } from '@/lib/apiInstance';
import type {
  AuthFormValues,
  CreateUserRequest,
  TelegramUser,
  UserDocument,
} from '@/types';

export const userApi = {
  baseKey: 'user',
  createUser: (data: CreateUserRequest) => {
    return jsonApiInstance('add-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
  connectTelegram: (data: { telegramUser: TelegramUser; userId: string }) => {
    return jsonApiInstance('add-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
  getUser: (userId: string) => {
    return queryOptions({
      queryKey: [userApi.baseKey, userId],
      queryFn: () =>
        jsonApiInstance<UserDocument[]>(`get-user?clerkId=${userId}`),
    });
  },
  deleteTelegram: (userId: string) => {
    return jsonApiInstance('delete-telegram', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerkId: userId }),
    });
  },
  updateUser: (
    clerkId: string,
    configNumber: number,
    performanceParameters: AuthFormValues,
  ) => {
    return jsonApiInstance('update-user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerkId, configNumber, performanceParameters }),
    });
  },
  inviteUser: ({
    email,
    userRole,
    subscriptionDuration,
    token,
  }: {
    email: string;
    userRole: string;
    subscriptionDuration: number;
    token: string;
  }) => {
    return jsonApiInstance('user-invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, userRole, subscriptionDuration }),
    });
  },
};
