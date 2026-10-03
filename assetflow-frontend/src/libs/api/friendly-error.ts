import type { ApiError } from './api-error';

/**
 * Turns any API error into a plain message for non-technical users:
 * no status codes, no request ids, no field names like "purchasePrice".
 * (Developers still see the full Problem Details in the browser DevTools and the server log.)
 */
export function friendlyMessage(error: ApiError | null | undefined): string {
  if (!error) return '';
  const slug = error.type.split('/').pop() ?? '';

  if (slug.includes('timeout')) {
    return 'The server is taking too long to respond. Please try again.';
  }
  if (error.status === 0) {
    return "We can't reach the server right now. Please check your connection and try again.";
  }

  switch (error.status) {
    case 400:
      // Validation lists mention technical field names, so show one general sentence
      return slug === 'validation-error' || error.errors.length > 0
        ? 'Some details are missing or not in the right format. Please check the form and try again.'
        : error.detail || 'Some details are not valid. Please check and try again.';
    case 401:
      return 'Your session has ended. Please sign in again.';
    case 403:
      return "You don't have permission to do this. Ask an administrator if you need access.";
    case 404:
      return "We couldn't find this item. It may have been removed. Please refresh the page.";
    case 409:
    case 422:
      // Our business-rule messages are already written for people
      return (
        error.detail ||
        'This change conflicts with the latest data. Please refresh the page and try again.'
      );
    case 429:
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return error.status >= 500
        ? 'Something went wrong on our side. Please try again in a moment.'
        : error.detail || 'Something went wrong. Please try again.';
  }
}
