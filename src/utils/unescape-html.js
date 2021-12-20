export default string => string
  .replace('&amp;', '&')
  .replace('&quot;', '"')
  .replace('&#39;', `'`)
  .replace('&lt;', '<')
  .replace('&gt;', '>');
