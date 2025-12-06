import i18n from '@/i18n';

export const formatDateTime = (date: Date | string | number): string => {
  const d = new Date(date);
  const lang = i18n.resolvedLanguage || i18n.language || 'en';

  if (lang.startsWith('en')) {
    const dayMonth = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
    }).format(d);

    const time = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);

    return `${dayMonth} • ${time}`;
  }

  let result = new Intl.DateTimeFormat(lang, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);

  if (lang.startsWith('lt')) {
    result = result.replace(/\./g, '');
  }

  return result.replace(/\s+/g, ' ').replace(/,/g, '').trim();
};
