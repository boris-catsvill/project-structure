export default function comma(num) {
  num = String(num);
  return [...num]
    .reverse()
    .reduce((acc, chr, index) => {
      acc.push(chr);
      if ((index + 1) % 3 === 0 && index < num.length - 1) acc.push(",");
      return acc;
    }, [])
    .reverse()
    .join("");
}
