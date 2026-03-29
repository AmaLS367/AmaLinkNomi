// Minimal logger that avoids logging sensitive data
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, ...sanitize(meta) }));
  },
  error: (message: string, meta?: any) => {
    console.error(JSON.stringify({ level: 'error', message, ...sanitize(meta) }));
  },
  warn: (message: string, meta?: any) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...sanitize(meta) }));
  }
};

function sanitize(meta: any) {
  if (!meta) return undefined;
  try {
    const clone = JSON.parse(JSON.stringify(meta));
    // Strip out known secrets or heavy objects
    if (clone.authorization) clone.authorization = '***';
    if (clone.key) clone.key = '***';
    if (clone.token) clone.token = '***';
    return clone;
  } catch(e) {
    return "[Unserializable meta]";
  }
}
