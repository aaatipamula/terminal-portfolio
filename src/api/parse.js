import * as bins from "./bins"

export default function parse(input) {
  if (input === "") return input;
  const args = input.split(/\s+/);
  const prog = args.shift();
  if (!(prog in bins)) return `${prog}: not found.`;
  return bins[prog](args)
}
