import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { userApi } from '@/api/userApi';
import type { AuthFormValues, UserDocument, UserInfo } from '@/types';

export const useSettingsMutation = (clerkId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const addConfig = useMutation({
    mutationFn: ({
      clerkId,
      configNumber,
      performanceParameters,
      userInfo,
    }: {
      clerkId: string;
      configNumber: number;
      performanceParameters: AuthFormValues;
      userInfo: UserInfo;
    }) =>
      userApi.addConfig(clerkId, configNumber, performanceParameters, userInfo),
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({ queryKey: [userApi.baseKey, clerkId] });
    },
    onError: (error) => {
      console.error(error);
      setError(error.message);
    },
  });

  const switchConfig = useMutation({
    mutationFn: ({
      clerkId,
      configNumber,
    }: {
      clerkId: string;
      configNumber: number;
    }) => userApi.switchConfig(clerkId, configNumber),
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({ queryKey: [userApi.baseKey, clerkId] });
    },
    onError: (error) => {
      console.error(error);
      setError(error.message);
    },
  });

  const connectTelegram = useMutation({
    mutationFn: userApi.connectTelegram,
    onMutate: () => {
      setError('');
    },
    onSuccess: () => {
      setIsLoading(true);
      queryClient.invalidateQueries({ queryKey: [userApi.baseKey, clerkId] });
    },
    onError: (error) => {
      console.error(error);
      setError(error.message);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const deleteTelegram = useMutation({
    mutationFn: userApi.deleteTelegram,
    onMutate: async () => {
      setError('');
      await queryClient.cancelQueries({
        queryKey: [userApi.baseKey, clerkId],
      });

      const previousUserData = queryClient.getQueryData([
        userApi.baseKey,
        clerkId,
      ]);

      queryClient.setQueryData(
        [userApi.baseKey, clerkId],
        (old: UserDocument[]) => {
          return old.map((user, index) =>
            index === 0 ? { ...user, telegram: undefined } : user,
          );
        },
      );

      return { previousUserData };
    },
    onError: (error, _variables, context) => {
      if (context?.previousUserData) {
        queryClient.setQueryData(
          [userApi.baseKey, clerkId],
          context.previousUserData,
        );
      }
      console.error(error);
      setError(error.message);
    },
  });

  return {
    addConfig,
    connectTelegram,
    deleteTelegram,
    switchConfig,
    error,
    setError,
    isInvalidating: isLoading,
  };
};
