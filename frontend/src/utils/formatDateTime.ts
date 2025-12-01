export function formatDateTime(date: Date | string): string {
  const d = new Date(date);

  const day = d.getDate();
  const month = d.toLocaleString('en', { month: 'short' });
  const time = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${day} ${month} • ${time}`;
}
