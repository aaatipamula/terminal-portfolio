import { filetree } from '../resources/index.json'

function parseArgs(args) {
  let finalArgs = new Set();
  for (let arg of args) {
    if (arg.startsWith('-')) arg.slice(1).split('').forEach(e => (finalArgs.add(e)));
  }
  return finalArgs
}

function echo(args) {
  if (args.length === 0) return '';
  let str = args.reduce((prev, curr) => prev + ' ' + curr);
  return '\n' + str;
}

function ls(args) {
  let final = ""
  args = parseArgs(args)
  for (let file of filetree.children) {
    let filestring = "\n" + file.name

    if (args.has("l")) {
      filestring = ((file.isDir) ? '\nd' : '\n-') + "rwx------- " + file.name
    }

    if (! args.has("a") && file.name.startsWith(".")) {
      filestring = ""
    }

    final += filestring
  }
  return final
}

export { 
  echo, ls
}
