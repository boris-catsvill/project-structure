/*
Date.prototype.setMonth():
The current day of month will have an impact on the behavior of this method.
Conceptually it will add the number of days given by the current day of the
month to the 1st day of the new month specified as the parameter, to return the new date.
For example, if the current value is 31st August 2016, calling setMonth
with a value of 1 will return 2nd March 2016. This is because in 2016 February had 29 days.

To implement expected behaviour we use custom method.
*/
const setUTCMonthCorrectly = (date, month) => {
  const d = date.getUTCDate();
  date.setUTCMonth(Number(month));
  if (date.getUTCDate() !== d) {
    date.setUTCDate(0);
  }
  return date;
};

export default setUTCMonthCorrectly;
