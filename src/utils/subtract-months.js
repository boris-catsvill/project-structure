export default function subtractMonths(date, months) {
  date.setMonth(date.getMonth() - months);
  return date;
}