import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

process.on('unhandledRejection', (reason, promise) => {
  // console.log('reason: ', reason, 'promise: ', promise);
  /* Заглушка в node для window.addEventListener('unhandledrejection') */
});
