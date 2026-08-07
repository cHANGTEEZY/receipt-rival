type LogArgs = unknown[];

function log(level: "debug" | "info" | "warn" | "error", ...args: LogArgs) {
  if (!__DEV__ && level === "debug") {
    return;
  }

  const prefix = `[app:${level}]`;
  switch (level) {
    case "debug":
      console.debug(prefix, ...args);
      break;
    case "info":
      console.info(prefix, ...args);
      break;
    case "warn":
      console.warn(prefix, ...args);
      break;
    case "error":
      console.error(prefix, ...args);
      break;
  }
}

export const logger = {
  debug: (...args: LogArgs) => log("debug", ...args),
  info: (...args: LogArgs) => log("info", ...args),
  warn: (...args: LogArgs) => log("warn", ...args),
  error: (...args: LogArgs) => log("error", ...args),
};
