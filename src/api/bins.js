import { filetree } from '../../resources/index.json' // Temp filesystem for testing, create a filesystem API soon

/* Helper function to parse args for commands */
function parseArgs(args) {
  let finalArgs = []
  for (let arg of args) {
    if (arg.startsWith("--")) finalArgs.push(arg.slice(2));
    else if (arg.startsWith('-')) arg.slice(1).split('').forEach(e => (finalArgs.push(e)));
    else finalArgs.push(arg);
  }
  return finalArgs
}

/* TODO: Bin funcs to implement:
 * su
 * man
 * help
 * theme
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

function echo({ args }) {
  if (args.length === 0) return args;
  let str = args.join(' ')
  return str;
}

function ls({ ctx, args }) {
  args = parseArgs(args)
  // Validate path after filesystem api implemented

  let final = filetree.children.reduce((fileArr, file) => {
    let filestring = file.name

    if (args.includes('l') || args.includes("list")) {
      filestring = ((file.isDir) ? 'd' : '-') + `rwxr-x----  ${ctx.username} ${file.name}`
    }

    if (!(args.includes('a') || args.includes("all")) && file.name.startsWith('.')) return fileArr;
    
    fileArr.push(filestring);
    return fileArr;
  }, [])

  return final.join('\n');
}

function cd({ ctx, args }) {
  args = parseArgs(args);
  const path = args.pop();
  if (path === undefined) return;
  // Validate path after filesytem api implemented
  ctx.setDir(path);
}

function pwd({ ctx }) {
  return ctx.cwd;
}

function history({ args, ctx }) {
  args = parseArgs(args)
  if (args.includes("clear")) {
    ctx.setHist([]);
    return;
  }
  return ctx.history.join("\n");
}

function hist({ args, ctx }) {
  return history({ args: args, ctx: ctx });
}

export { 
  echo, ls, cd, pwd, history, hist
}
