/**
 * Simple logging utility with optional ANSI colors
 *
 * WHY: US3 requires observability into agent communications. This logger wraps
 * console.log with color support and structured formatting for readability.
 * Constitution principle: "Minimal ceremony" - no Winston/Pino needed yet.
 */

/**
 * ANSI color codes for terminal output
 *
 * WHY: Makes agent messages easier to distinguish visually
 */
const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Foreground colors
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",

  // Background colors
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

/**
 * Agent color mapping for consistent visual identification
 *
 * WHY: Each agent gets a unique color for easy tracking in logs
 */
const AGENT_COLORS: Record<string, string> = {
  coordinator: COLORS.cyan,
  theme: COLORS.magenta,
  food: COLORS.yellow,
  decor: COLORS.green,
  purchase: COLORS.blue,
  dj: COLORS.red,
  contact: COLORS.white,
};

/**
 * Format timestamp for log messages
 *
 * WHY: US3 requires timestamps on all messages
 */
function formatTimestamp(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const ms = now.getMilliseconds().toString().padStart(3, "0");
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

/**
 * Main logger class
 *
 * WHY: Centralized logging with consistent formatting
 */
export class Logger {
  private useColors: boolean;
  private verbose: boolean;

  constructor(options: { colors?: boolean; verbose?: boolean } = {}) {
    this.useColors = options.colors ?? true;
    this.verbose = options.verbose ?? false;
  }

  /**
   * Colorize text if colors are enabled
   *
   * WHY: Allows disabling colors for file output or CI environments
   */
  private colorize(text: string, color: string): string {
    if (!this.useColors) return text;
    return `${color}${text}${COLORS.reset}`;
  }

  /**
   * Log agent message with formatting
   *
   * WHY: US3 requires visibility into agent communications
   */
  logMessage(from: string, to: string, type: string, content: any): void {
    const timestamp = formatTimestamp();
    const color = AGENT_COLORS[from] || COLORS.white;
    const fromFormatted = this.colorize(from.padEnd(12), color);
    const toFormatted = this.colorize(
      to.padEnd(12),
      AGENT_COLORS[to] || COLORS.white
    );

    console.log(
      `${this.colorize(
        timestamp,
        COLORS.gray
      )} ${fromFormatted} → ${toFormatted} [${type}]`
    );

    if (this.verbose && content) {
      console.log(
        this.colorize("  Content:", COLORS.dim),
        JSON.stringify(content, null, 2)
      );
    }
  }

  /**
   * Log agent decision with confidence score
   *
   * WHY: US3 requires showing verbalized sampling outputs with confidence
   */
  logDecision(agentId: string, description: string, confidence: number): void {
    const timestamp = formatTimestamp();
    const color = AGENT_COLORS[agentId] || COLORS.white;
    const agentFormatted = this.colorize(agentId.padEnd(12), color);
    const confidenceColor =
      confidence >= 0.8
        ? COLORS.green
        : confidence >= 0.5
        ? COLORS.yellow
        : COLORS.red;
    const confidenceFormatted = this.colorize(
      `${(confidence * 100).toFixed(0)}%`,
      confidenceColor
    );

    console.log(
      `${this.colorize(
        timestamp,
        COLORS.gray
      )} ${agentFormatted} DECIDED: ${description} (confidence: ${confidenceFormatted})`
    );
  }

  /**
   * Log consensus vote result
   *
   * WHY: US3 requires showing voting results and which agents supported winner
   */
  logConsensus(
    winner: string,
    votes: number,
    total: number,
    supporters: string[]
  ): void {
    const timestamp = formatTimestamp();
    const percentage = ((votes / total) * 100).toFixed(0);

    console.log(
      `${this.colorize(timestamp, COLORS.gray)} ${this.colorize(
        "CONSENSUS",
        COLORS.bgGreen + COLORS.bright
      )} ${winner} (${votes}/${total} = ${percentage}%)`
    );

    if (this.verbose) {
      console.log(
        this.colorize("  Supporters:", COLORS.dim),
        supporters.join(", ")
      );
    }
  }

  /**
   * Log phase start (e.g., "Theme Selection", "Menu Planning")
   *
   * WHY: Helps user understand planning session progress
   */
  logPhase(phaseName: string): void {
    const timestamp = formatTimestamp();
    console.log(
      `\n${this.colorize(timestamp, COLORS.gray)} ${this.colorize(
        `=== ${phaseName} ===`,
        COLORS.bright
      )}`
    );
  }

  /**
   * Log error with highlighting
   *
   * WHY: Errors should be visually distinct
   */
  error(message: string, error?: Error): void {
    const timestamp = formatTimestamp();
    console.error(
      `${this.colorize(timestamp, COLORS.gray)} ${this.colorize(
        "ERROR",
        COLORS.bgRed + COLORS.bright
      )} ${message}`
    );

    if (error && this.verbose) {
      console.error(this.colorize("  Stack:", COLORS.dim), error.stack);
    }
  }

  /**
   * Log info message
   *
   * WHY: General information messages
   */
  info(message: string): void {
    const timestamp = formatTimestamp();
    console.log(
      `${this.colorize(timestamp, COLORS.gray)} ${this.colorize(
        "INFO",
        COLORS.bgBlue
      )} ${message}`
    );
  }

  /**
   * Log success message
   *
   * WHY: Highlight successful completion
   */
  success(message: string): void {
    const timestamp = formatTimestamp();
    console.log(
      `${this.colorize(timestamp, COLORS.gray)} ${this.colorize(
        "SUCCESS",
        COLORS.bgGreen + COLORS.bright
      )} ${message}`
    );
  }

  /**
   * Log warning message
   *
   * WHY: Non-critical issues that user should know about
   */
  warn(message: string): void {
    const timestamp = formatTimestamp();
    console.warn(
      `${this.colorize(timestamp, COLORS.gray)} ${this.colorize(
        "WARNING",
        COLORS.bgYellow
      )} ${message}`
    );
  }
}

/**
 * Singleton logger instance
 *
 * WHY: Most parts of code will use same logger configuration
 */
let globalLogger: Logger | null = null;

export function getLogger(options?: {
  colors?: boolean;
  verbose?: boolean;
}): Logger {
  if (!globalLogger) {
    globalLogger = new Logger(options);
  }
  return globalLogger;
}

export function setLogger(logger: Logger): void {
  globalLogger = logger;
}
