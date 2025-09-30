import { z } from 'zod';

export const validateForm = <T>(
  values: T,
  schema: z.ZodSchema<T>,
): Record<string, string> => {
  try {
    schema.parse(values);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return errors;
    }
    return {};
  }
};

export const useFormValidation = <T>(schema: z.ZodSchema<T>) => {
  return (values: T) => validateForm(values, schema);
};
