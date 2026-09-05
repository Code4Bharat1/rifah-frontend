import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // Read the locale from the cookie (set by the LanguageSelector)
  // If not found, default to 'en'
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
