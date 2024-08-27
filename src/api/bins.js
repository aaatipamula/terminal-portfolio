// import { filetree } from '../../resources/index.json' // Temp filesystem for testing, create a filesystem API soon

/* Helper function to parse args for commands */
function parseArgs(args) {
  let opts = [];
  const positional = [];
  for (const arg of args) {
    if (arg.startsWith('--')) opts.push(arg.slice(2));
    else if (arg.startsWith('-')) opts = opts.concat(arg.slice(1).split(''));
    else positional.push(arg);
  }
  console.log(opts, positional)
  return { opts: opts, positional: positional };
}

/* Expand the "~", ".", and ".." to the full path */
function expandPath(username, to_path, from_path) {
  const home = `/home/${username}`;
  to_path = to_path.startsWith("~") ? to_path.replace("~", home) : to_path;
  from_path = from_path.startsWith("~") ? from_path.replace("~", home) : from_path;
  console.log(to_path, from_path);
  while (to_path.startsWith("..")) {
    from_path = from_path.replace(/\/\w*\/?$/gm, "");
    to_path = to_path.replace(/..\/?/, "");
    to_path = from_path + "/" + to_path;
    console.log(to_path, from_path);
  }
  return to_path;
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
  const abs_path = path ? expandPath(ctx.username, path, ctx.cwd) : ctx.cwd;

  // TODO: Replace url with an env variable
  try{
    const res = await fetch("http://localhost:5000/fs" + abs_path);

    if (res.ok) {
      const reduceDirObj = (fileArr, file) =>  {
        if (!(args.opts.includes('a') || args.opts.includes("all")) && file.name.startsWith('.')) return fileArr;

        let filestring = file.name;

        if (args.opts.includes('l') || args.opts.includes("list")) {
          filestring = `${file.permissions}\t${file.owner}\t${file.group}\t${file.size}\t${file.modified_time}\t${file.name}`;
        }

        fileArr.push(filestring);
        return fileArr;
      }

      const data = await res.json();
      const dirObj = (Array.isArray(data)) ? data : [data];
      const final = (dirObj) ? dirObj.reduce(reduceDirObj, []) : "total 0";
      return final.join('\n');
    }

  } catch(err) {
    return "ls: Some error occured";
  }
  return `ls: ${path}: does not exist.`;
}

async function cd({ ctx, args }) {
  args = parseArgs(args);
  const path = args.positional.pop();
  const abs_path = path ? expandPath(ctx.username, path, ctx.cwd) : `/home/${ctx.username}`;

  let msg = `cd: ${path}: does not exist.`;
  try {
    // TODO: Validate path after filesytem api implemented
    console.log("http://localhost:5000/fs" + abs_path);
    const res = await fetch("http://localhost:5000/fs" + abs_path);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        ctx.cwd = abs_path;
        msg = "";
      } else msg = `cd: ${path}: is not a directory.`;
    }
  } catch (err) {
    return "cd: Some error occured"
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

async function fullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

async function help() {
  return `Commands:
  echo - Repeat all following text after 'echo'
  ls - List all files in current directory
  cd - Print the current working directory
  history/hist - List the history of commands you've used
  su - Switch user
  fullscreen - Make the tab full screen
  help - display this help page
  `
}

export {
  echo, ls, cd, pwd, history, hist,
  su, fullscreen, help
}

