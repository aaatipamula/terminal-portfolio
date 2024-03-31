import * as bins from "./bins"

/* Parse commands and args */
export default function parse(input, env) {
  if (input === "") return input; // Ignore any empty input
  const commands = input.split(/\s*;\s*/); // multiple commands with ;
  const output = commands.map((sub_input) => {
    const raw_args = sub_input.split(/\s+/); // Split by whitespace
    const prog = raw_args.shift(); // What program we are using
    if (!(prog in bins)) return `${prog}: not found.`; // Grab the program function if found
    return bins[prog]({args: raw_args, ctx: env}) // Run program and calculate output
  })
  return output.join("\n")
}
