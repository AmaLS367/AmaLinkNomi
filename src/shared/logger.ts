// Minimal logger that avoids logging sensitive data
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify(buildLogEntry('info', message, meta)));
  },
  error: (message: string, meta?: any) => {
    console.error(JSON.stringify(buildLogEntry('error', message, meta)));
  },
  warn: (message: string, meta?: any) => {
    console.warn(JSON.stringify(buildLogEntry('warn', message, meta)));
  }
};

function buildLogEntry(level: 'info' | 'error' | 'warn', message: string, meta?: any) {
  const sanitized = sanitize(meta);
  return typeof sanitized === 'object' && sanitized !== null
    ? { level, message, ...(sanitized as Record<string, unknown>) }
    : { level, message, meta: sanitized };
}

function sanitize(meta: any) {
  if (!meta) return undefined;

  try {
    return redactSecrets(JSON.parse(JSON.stringify(meta)));
  } catch (e) {
    return '[Unserializable meta]';
  }
}

function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSecrets);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => {
      if (/(authorization|token|secret|api[_-]?key|key)$/i.test(key)) {
        return [key, '***'];
      }

      return [key, redactSecrets(nestedValue)];
    })
  );
}
