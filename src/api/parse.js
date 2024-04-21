import * as bins from "./bins"


/* Parse commands and args */
export default async function parse(input, env) {

  const apply = async (program) => {
    const raw_args = program.split(/\s+/); // Split by whitespace
    const prog = raw_args.shift(); // What program we are using
    if (!(prog in bins)) {
      return `${prog}: not found.`; // Grab the program function if found
    } else if (prog === "") {
      return "" // Ignore any empty splits
    }
    return await bins[prog]({args: raw_args, ctx: env}) // Run program and calculate output
  }

  if (input === "") return input; // Ignore any empty input
  const commands = input.split(/\s*;\s*/); // multiple commands with ;
  const output = await Promise.all(commands.map(apply));
  return output.join("\n")
}
