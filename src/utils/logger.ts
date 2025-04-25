import { createLogger, format, transports } from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
import 'winston-daily-rotate-file';
import path from 'path';

const logDir =
  process.env.NODE_ENV === 'production'
    ? '/tmp/logs'
    : path.join(process.cwd(), 'logs');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(
      ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`,
    ),
  ),
  transports: [
    new transports.DailyRotateFile({
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '100d',
    }),
    new transports.Console(),
    // new WinstonCloudWatch({
    //   logGroupName: process.env.CLOUDWATCH_LOG_GROUP_NAME || 'nextjs-app-logs',
    //   logStreamName: () => {
    //     // Use a function to dynamically generate the log stream name
    //     const date = new Date().toISOString().split('T')[0];
    //     return `${process.env.CLOUDWATCH_LOG_STREAM_NAME || 'nextjs-app-stream'}-${date}`;
    //   },
    //   awsRegion: process.env.ADMIN_AWS_REGION || 'us-east-1',
    //   awsAccessKeyId: process.env.ADMIN_AWS_ACCESS_KEY_ID,
    //   awsSecretKey: process.env.ADMIN_AWS_SECRET_ACCESS_KEY,
    //   messageFormatter: ({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`,
    // }),
  ],
});

if (process.env.NODE_ENV === 'production') {
  // if (true) {
  const cloudwatchConfig = {
    logGroupName: process.env.CLOUDWATCH_LOG_GROUP_NAME || 'nextjs-app-logs',
    logStreamName: () => {
      // Use a function to dynamically generate the log stream name
      const date = new Date().toISOString().split('T')[0];
      return `${process.env.CLOUDWATCH_LOG_STREAM_NAME || 'nextjs-app-stream'}-${date}`;
    },
    awsOptions: {
      credentials: {
        accessKeyId: process.env.ADMIN_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.ADMIN_AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.ADMIN_AWS_REGION || 'us-east-1',
    },
    messageFormatter: (logObject) =>
      `${logObject.timestamp} ${logObject.level}: ${logObject.message}`,
  };
  logger.add(new WinstonCloudWatch(cloudwatchConfig));
}

export default logger;
