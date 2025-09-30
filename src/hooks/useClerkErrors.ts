import { useTranslation } from 'react-i18next';

interface ClerkError {
  message: string;
  long_message: string;
  code: string;
  meta?: {
    paramName: string;
  };
}

interface ErrorFields {
  username: string;
  email_address: string;
  password: string;
  verificationCode: string;
  general: string;
}

export const useClerkErrors = () => {
  const { t } = useTranslation('common');
  const processErrors = (errors: ClerkError[]): ErrorFields => {
    const errorObj: ErrorFields = {
      username: '',
      email_address: '',
      password: '',
      verificationCode: '',
      general: '',
    };

    const errorsArray = Array.isArray(errors) ? errors : [errors];

    errorsArray.forEach((error) => {
      const paramName = error.meta?.paramName;
      const errorCode = error.code;

      if (paramName && paramName in errorObj) {
        errorObj[paramName as keyof ErrorFields] = t(
          `clerk.${paramName}.${errorCode}`,
        );
      } else {
        errorObj.general = t(`clerk.general.${errorCode}`);
      }
    });
    return errorObj;
  };

  return { processErrors };
};
