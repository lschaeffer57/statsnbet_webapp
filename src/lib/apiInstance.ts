class ApiError extends Error {
  constructor(public response: Response) {
    super('ApiError:' + response.status);
  }
}

export const jsonApiInstance = async <T>(url: string, init?: RequestInit) => {
  const result = await fetch(`/api/${url}`, { ...init });

  if (!result.ok) {
    throw new ApiError(result);
  }

  return (await result.json()) as Promise<T>;
};
