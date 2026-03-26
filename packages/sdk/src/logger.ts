import pino from 'pino';

export const logger = pino({
  name: 'eterecitizen-sdk',
  level: process.env.ETERECITIZEN_LOG_LEVEL || 'info',
});

export type Logger = pino.Logger;

export function createChildLogger(module: string): pino.Logger {
  return logger.child({ module });
}
