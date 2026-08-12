/** Tiny dependency-free flag parser: `--flag value`, `--flag=value`, `--boolean`. */
export interface ParsedArgs {
  flags: Map<string, string | true>;
  positional: string[];
}

export function parseArgs(argv: readonly string[]): ParsedArgs {
  const flags = new Map<string, string | true>();
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]!;
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }
    const body = token.slice(2);
    const eq = body.indexOf('=');
    if (eq !== -1) {
      flags.set(body.slice(0, eq), body.slice(eq + 1));
      continue;
    }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      flags.set(body, next);
      i++;
    } else {
      flags.set(body, true);
    }
  }
  return { flags, positional };
}

export function stringFlag(args: ParsedArgs, name: string, fallback: string): string {
  const value = args.flags.get(name);
  if (value === undefined) return fallback;
  if (value === true) throw new Error(`--${name} requires a value`);
  return value;
}

export function optionalStringFlag(args: ParsedArgs, name: string): string | undefined {
  const value = args.flags.get(name);
  if (value === undefined || value === true) return undefined;
  return value;
}

export function intFlag(args: ParsedArgs, name: string, fallback: number): number {
  const value = args.flags.get(name);
  if (value === undefined) return fallback;
  if (value === true) throw new Error(`--${name} requires a value`);
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) throw new Error(`--${name} must be an integer, got ${JSON.stringify(value)}`);
  return parsed;
}

export function boolFlag(args: ParsedArgs, name: string): boolean {
  const value = args.flags.get(name);
  if (value === undefined) return false;
  if (value === true) return true;
  return value !== 'false' && value !== '0';
}
