import * as bins from "./bins"

export default function parse(input, ctx) {
  if (input === "") return input;
  const raw_args = input.split(/\s+/);
  const prog = raw_args.shift();
  if (!(prog in bins)) return `${prog}: not found.`;
  return bins[prog]({args: raw_args, ctx: ctx})
}
