// import { filetree } from '../../resources/index.json' // Temp filesystem for testing, create a filesystem API soon

/* Helper function to parse args for commands */
function parseArgs(args) {
  const parsed = Object.create(null);
  parsed.opts = [];
  parsed.positional = [];
  for (const arg of args) {
    if (arg.startsWith("--")) parsed.opts.push(arg.slice(2));
    else if (arg.startsWith('-')) parsed.opts = parsed.opts.concat(arg.slice(1).split(''));
    else parsed.positional.push(arg);
  }
  return parsed
}

function expandPath(to_path, from_path) {
  if (to_path === undefined) return "/home/aaatipamula";
  to_path = to_path.startsWith("~") ? to_path.replace("~", "/home/aaatipamula") : to_path;
  from_path = from_path.startsWith("~") ? from_path.replace("~", "/home/aaatipamula") : from_path;
  while (to_path.startsWith("..")) {
    from_path = from_path.replace(/\/\w*\/?$/gm, "");
    to_path = to_path.replace(/..\/?/, "");
  }
  return from_path + "/" + to_path
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

async function echo({ args }) {
  if (args.length === 0) return args;
  let str = args.join(' ');
  return str;
}


async function ls({ ctx, args }) {
  args = parseArgs(args);
  const path = args.positional.pop();
  const abs_path = expandPath(path, ctx.cwd);

  const res = await fetch("http://localhost:5000/fs" + abs_path);

  if (res.ok) {
    const ReduceFileobj = (fileArr, file) =>  {
      if (!(args.opts.includes('a') || args.opts.includes("all")) && file.name.startsWith('.')) return fileArr;

      let filestring = file.name;

      if (args.opts.includes('l') || args.opts.includes("list")) {
        filestring = `${file.mode} ${file.uid} ${file.gid} ${file.size} ${file.created} ${file.name}`;
      }

      fileArr.push(filestring);
      return fileArr;
    }

    const data = await res.json();
    const fileobj = (data.type === "dir") ? data.fileobj : [data.fileobj];
    const final = fileobj.reduce(ReduceFileobj, []);

    return final.join("\n");
  }

  return `ls: ${path}: does not exist.`;
}


async function cd({ ctx, args }) {
  args = parseArgs(args);
  const path = args.positional.pop();
  const abs_path = expandPath(path, ctx.cwd);
  // TODO: Validate path after filesytem api implemented
  let msg = `cd: ${path}: does not exist.`;
  const res = await fetch("http://localhost:5000/fs" + abs_path);
  if (res.ok) {
    const data = await res.json()
    if (data.type === "dir") {
      ctx.cwd = abs_path;
      msg = "";
    } else msg = `cd: ${path}: is not a directory.`;
  }
  return msg;
}


async function pwd({ ctx }) {
  return ctx.cwd;
}


async function history({ ctx, args }) {
  args = parseArgs(args)
  const opt = args.positional.pop();
  if (opt === "clear") {
    ctx.history = [];
    return;
  } else if (opt !== undefined) return "history: Invalid argument(s)";
  return ctx.history.map((val, index) => String(index + 1).padStart(3, ' ') + " " + val).join("\n");
}


async function hist({ ctx, args }) {
  return history({ args: args, ctx: ctx });
}


async function su({ ctx, args }) {
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

