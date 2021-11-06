export default function (func, delay) {
  let timerId;
  let calls = 0;
  return function (args) {
    if (calls === 0) func(args);
    clearTimeout(timerId);
    timerId = setTimeout(function () {
      if (calls > 1) func(args);
      calls = 0;
    }, delay);
    calls++;
  };
}
