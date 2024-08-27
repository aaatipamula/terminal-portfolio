import * as bins from "./bins"

/**
 * @typedef { import('../types').Env } Env
 */

/** Parse commands and args
 * @param { string } input
 * @param { Env } env
 * @returns { Promise<string> }
 */
export default async function parse(input, env) {

  /**
   * @param { string } line
   * @returns { Promise<string> }
   */
  const apply = async (line) => {
    const raw_args = line.split(/\s+/); // Split by whitespace
    const prog = raw_args.shift(); // What program we are using
    if (!(prog in bins)) {
      return `${prog}: not found.`; // Grab the program function if found
    } else if (prog === "") {
      return ""; // Ignore any empty splits
    }
    return await bins[prog]({args: raw_args, ctx: env}); // Run program and calculate output
  }

  if (input === "") return input; // Ignore any empty input
  const commands = input.split(/\s*;\s*/); // multiple commands with ;
  const output = await Promise.all(commands.map(command => {
    console.log("Apply:", command);
    return apply(command)
  }));
  return output.join("\n");
}
