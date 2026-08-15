/**
 * Formats any date string (YYYY-MM-DD, ISO, or with timestamp) into DD/MM/YYYY [hh:mm AM/PM] format.
 * Example:
 * "2026-08-10" -> "10/08/2026"
 * "2026-08-10 09:15 AM" -> "10/08/2026 09:15 AM"
 */
export const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr || dateStr === '-') return '-';

  const str = String(dateStr).trim();

  // Check if string starts with YYYY-MM-DD
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})(.*)$/);
  if (match) {
    const [, year, month, day, rest] = match;
    const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    return rest ? `${formattedDate}${rest}` : formattedDate;
  }

  // Fallback parsing via JS Date
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, '0');
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const year = parsed.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      if (str.includes(':')) {
        const timeStr = parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${formattedDate} ${timeStr}`;
      }
      return formattedDate;
    }
  } catch (e) {}

  return str;
};

/**
 * Returns current timestamp in DD/MM/YYYY hh:mm AM/PM format.
 * Example: "15/08/2026 10:20 AM"
 */
export const getNowFormattedDDMMYYYY = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${day}/${month}/${year} ${timeStr}`;
};
