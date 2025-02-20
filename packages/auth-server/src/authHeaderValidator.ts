import { IncomingHttpHeaders } from 'http';

const BEARER_PREFIX = 'Bearer ';

export const isValidAuthHeader = (headers: IncomingHttpHeaders) => {
  const authHeader = headers.authorization ?? '';

  // missing auth header prefix
  if (!authHeader.startsWith(BEARER_PREFIX)) {
    return false;
  }

  // remove bearer prefix
  const token = authHeader.slice(BEARER_PREFIX.length);

  // validate equivalent
  return token === process.env.AUTH_SERVER_SECRET;
};
