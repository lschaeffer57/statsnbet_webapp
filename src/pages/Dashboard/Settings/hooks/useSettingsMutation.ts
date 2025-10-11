import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { userApi } from '@/api/userApi';
import type { AuthFormValues, UserDocument } from '@/types';

export const useSettingsMutation = (clerkId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const updateUser = useMutation({
    mutationFn: ({
      clerkId,
      performanceParameters,
    }: {
      clerkId: string;
      performanceParameters: AuthFormValues;
    }) => userApi.updateUser(clerkId, performanceParameters),
    onSuccess: () => {
      setError('');
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [userApi.baseKey, clerkId] });
    },
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
        (old: UserDocument) => ({
          ...old,
          telegram: undefined,
        }),
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
    updateUser,
    connectTelegram,
    deleteTelegram,
    error,
    setError,
    isInvalidating: isLoading,
  };
};
