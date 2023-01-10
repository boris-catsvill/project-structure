const LOCALES = ['ru-RU', 'en-US'];

const currencyFormatter = new Intl.NumberFormat(LOCALES, {
  style: 'currency',
  currency: 'USD'
});

/**
 * Форматирует дату и время
 * @param {string} value
 * @return {string}
 */
export function dateFormat(value) {
  const date = new Date(value);
  return date.toLocaleDateString(LOCALES, { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' ' + date.toLocaleTimeString(LOCALES, { hour: '2-digit', minute: '2-digit' });
}

/**
 * Форматирует валюту
 * @param {Number} value
 * @return {string}
 */
export function currencyFormat(value) {
  return currencyFormatter.format(value);
}
