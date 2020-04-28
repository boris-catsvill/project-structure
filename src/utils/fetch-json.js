// same as fetch, but throws FetchError in case of errors
// status >= 400 is an error
// network error / json error are errors

export default async function(url, params) {
  let response;

  try {
    // NOTE: "toString" call needed for correct work of "jest-fetch-mock"
    response = await fetch(url.toString(), params);
  } catch(err) {
    throw new FetchError(response, "Network error has occurred.");
  }

  let body;

  if (!response.ok) {
    let errorText = response.statusText; // Not Found (for 404)

    try {
      body = await response.json();

      errorText = (body.error && body.error.message) || (body.data && body.data.error && body.data.error.message) || errorText;
    } catch (error) { /* ignore failed body */ }

    let message = `Error ${response.status}: ${errorText}`;

    throw new FetchError(response, body, message);
  }

  try {
    return await response.json();
  } catch(err) {
    throw new FetchError(response, null, err.message);
  }
}

export class FetchError extends Error {
  name = "FetchError";

  constructor(response, body, message) {
    super(message);
    this.response = response;
    this.body = body;
  }
}

// handle uncaught failed fetch through
window.addEventListener('unhandledrejection', event => {
  if (event.reason instanceof FetchError) {
    alert(event.reason.message);
  }
});

