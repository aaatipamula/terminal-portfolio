import { filetree } from '../../resources/index.json' // Temp filesystem for testing, create a filesystem API soon

/* Helper function to parse args for commands */
function parseArgs(args) {
  let finalArgs = new Set();
  for (let arg of args) {
    if (arg.startsWith('-')) arg.slice(1).split('').forEach(e => (finalArgs.add(e)));
  }
  return finalArgs
}

/* TODO: Bin funcs to implement:
 * cd
 * pwd
 * man
 * help
 * theme
 * clear
 * 
 * After filesystem API:
 * cat 
 * cp
 * mkdir
 * rmdir
 * mv
 * touch
 * head
 * tail
 * less (maybe lol)
 * >> and >
 * grep
 */

function echo(args) {
  if (args.length === 0) return '';
  let str = args.reduce((prev, curr) => prev + ' ' + curr);
  return str;
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
