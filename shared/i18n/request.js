import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // Always render English as the pristine base language for the entire platform.
  // Google Translate then translates the rendered DOM cleanly into all 113 languages
  // without double-translation corruption or server/client locale mismatch.
  let messages;
  try {
    messages = (await import('../../messages/en.json')).default;
  } catch {
    messages = {};
  }
 
  return {
    locale: 'en',
    messages,
  };
});


