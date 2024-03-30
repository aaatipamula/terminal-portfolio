import * as bins from "./bins"

/* Parse commands and args */
export default function parse(input, env) {
  if (input === "") return input; // Ignore any empty input
  const raw_args = input.split(/\s+/); // Split by whitespace
  const prog = raw_args.shift(); // What program we are using
  if (!(prog in bins)) return `${prog}: not found.`; // Grab the program function if found
  return bins[prog]({args: raw_args, ctx: env}) // Run program and calculate output
}
