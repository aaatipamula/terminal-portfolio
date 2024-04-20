import { filetree } from '../../resources/index.json' // Temp filesystem for testing, create a filesystem API soon


/* Helper function to parse args for commands */
function parseArgs(args) {
  const parsed = Object.create(null);
  parsed.opts = [];
  parsed.positional = [];
  for (const arg of args) {
    if (arg.startsWith("--")) parsed.opts.push(arg.slice(2));
    else if (arg.startsWith('-')) parsed.opts.concat(arg.slice(1).split(''))
    else parsed.positional.push(arg);
  }
  return parsed
}

/* TODO: Bin funcs to implement:
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
  let str = args.join(' ');
  return str;
}


function ls({ ctx, args }) {
  args = parseArgs(args);
  // const rawPath = args.positional.pop();
  // const path = (rawPath) ? rawPath : ctx.cwd;
  // TODO: Validate path after filesystem api implemented

  let final = filetree.children.reduce((fileArr, file) => {
    let filestring = file.name

    if (args.opts.includes('l') || args.opts.includes("list")) {
      filestring = ((file.isDir) ? 'd' : '-') + `rwxr-x----  ${ctx.username} ${file.name}`
    }

    if (!(args.opts.includes('a') || args.opts.includes("all")) && file.name.startsWith('.')) return fileArr;
    
    fileArr.push(filestring);
    return fileArr;
  }, [])

  return final.join('\n');
}


function cd({ ctx, args }) {
  args = parseArgs(args);
  const path = args.positional.pop();
  if (path === undefined) ctx.cwd = '~';
  // TODO: Validate path after filesytem api implemented
  else ctx.cwd = path;
}


function pwd({ ctx }) {
  return ctx.cwd;
}


function history({ ctx, args }) {
  args = parseArgs(args)
  const opt = args.positional.pop();
  if (opt === "clear") {
    ctx.history = [];
    return;
  } else if (opt !== undefined) return "history: Invalid argument(s)";
  return ctx.history.map((val, index) => String(index + 1).padStart(3, ' ') + " " + val).join("\n");
}


function hist({ ctx, args }) {
  return history({ args: args, ctx: ctx });
}


function su({ ctx, args }) {
  args = parseArgs(args);
  if (args.positional.length > 1) return "Please provide one user."
  const user = args.positional.pop()
  if (user === undefined) return "Please provide a user.";
  ctx.username = user;
}


export { 
  echo, ls, cd, pwd, history, hist,
  su
}
