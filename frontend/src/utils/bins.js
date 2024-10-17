/**
 * @typedef { import('../types').Env } Env
 * @typedef { import('../types').FileObj } FileObj
 */

const SERVER_URI = import.meta.env.VITE_SERVER_URI || "http://localhost:8000/";

/**
  * @param { string[] } args
  * @returns {{ opts: string[], positional: string[] }}
  */
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

/**
  * @param { string } username
  * @param { string } currentPath
  * @param { string } inputPath
  */
function expandPath(username, currentPath, inputPath) {
  const homeDir = `/home/${username}`;

  if (inputPath.startsWith('/')) {
    return inputPath;
  }

  if (inputPath.startsWith('~')) {
    inputPath = inputPath.slice(1);
    currentPath = homeDir;
  } else if (inputPath === '~') {
    inputPath = homeDir;
  }

  const pathParts = currentPath.split('/').filter(Boolean); // Removes empty parts

  inputPath.split('/').forEach(part => {
    if (part === '..') {
      if (pathParts.length > 0) pathParts.pop();

    } else if (part === '~') {
      pathParts.push('home');
      pathParts.push(username);

    } else if (part !== '.' && part !== '') {
      pathParts.push(part);
    }
  });

  return `/${pathParts.join('/')}`;
}

/**
  * @param { FileObj[] } arr
  */
function longestStrings(arr) {
    let maxOwnerLength = 0;
    let maxGroupLength = 0;
    let maxSizeLength = 0;

    arr.forEach(obj => {
        if (obj.owner && obj.owner.length > maxOwnerLength) {
            maxOwnerLength = obj.owner.length;
        }
        if (obj.group && obj.group.length > maxGroupLength) {
            maxGroupLength = obj.group.length;
        }
        if (obj.size && obj.size.length > maxSizeLength) {
            maxSizeLength = obj.size.length;
        }
    });

    return [maxOwnerLength + 1, maxGroupLength + 1, maxSizeLength + 1];
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

/**
  * @param {{ args: string[] }}
  */
async function echo({ args }) {
  if (args.length === 0) return args;
  let str = args.join(' ');
  return str;
}

/**
  * @param {{ ctx: Env, args: string[] }}
  */
async function ls({ ctx, args }) {
  args = parseArgs(args);
  const path = args.positional.pop();
  const abs_path = path ? expandPath(ctx.username, ctx.cwd, path) : ctx.cwd;

  // TODO: Replace url with an env variable
  try{
    const res = await fetch(SERVER_URI + "fs" + abs_path);
    if (res.ok) {
      const data = await res.json();
      if (data.error) return data.error;
      const dirObj = (Array.isArray(data)) ? data : [data];
      const [padOwner, padGroup, padSize] = longestStrings(dirObj);

      const reduceDirObj = (fileArr, file) =>  {
        if (!(args.opts.includes('a') || args.opts.includes("all")) && file.name.startsWith('.')) return fileArr;

        let filestring = file.is_directory ? `**${file.name}**` : file.name;

        if (args.opts.includes('l') || args.opts.includes("list")) {
          filestring = `${file.permissions} ${file.owner.padEnd(padOwner)}${file.group.padEnd(padGroup)}${file.size.padStart(padSize)} ${file.modified_time} ${filestring}`;
        }

        fileArr.push(filestring);
        return fileArr;
      }

      const joinChar = (args.opts.includes('l')) ? '\n' : ' '
      return (dirObj.length > 0) ? dirObj.reduce(reduceDirObj, []).join(joinChar) : "total 0";
    }

  } catch(err) {
    console.log(err)
    return "ls: Some error occured";
  }
  return `ls: ${path}: does not exist.`;
}

/**
  * @param {{ ctx: Env, args: string[] }}
  */
async function cd({ ctx, args }) {
  args = parseArgs(args);
  const path = args.positional.pop();
  const abs_path = path ? expandPath(ctx.username, ctx.cwd, path) : `/home/${ctx.username}`;

  let msg = `cd: ${path}: does not exist.`;
  try {
    const res = await fetch(SERVER_URI + "fs" + abs_path);
    if (res.ok) {
      const data = await res.json();
      if (data.error) return data.error;
      if (Array.isArray(data)) {
        ctx.cwd = abs_path;
        ctx.filetree = data;
        msg = "";
      } else msg = `cd: ${path}: is not a directory.`;
    }
  } catch (err) {
    console.log(err)
    return "cd: Some error occured"
  }
  return msg;
}

/**
  * @param {{ ctx: Env }}
  */
async function pwd({ ctx }) {
  return ctx.cwd;
}

/**
  * @param {{ ctx: Env, args: string[] }}
  */
async function history({ ctx, args }) {
  args = parseArgs(args)
  const opt = args.positional.pop();
  if (opt === "clear") {
    ctx.history = [];
    return;
  } else if (opt !== undefined) return "history: Invalid argument(s)";
  return ctx.history.map((val, index) => String(index + 1).padStart(3, ' ') + " " + val).join("\n");
}

/**
  * @param {{ ctx: Env, args: string[] }}
  */
async function hist({ ctx, args }) {
  return history({ args: args, ctx: ctx });
}

/**
  * @param {{ ctx: Env, args: string[] }}
  */
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
  echo           - Repeat all following text after 'echo'
  ls             - List all files in current directory
  cd             - Print the current working directory
  su             - Switch user
  history [hist] - List the history of commands you've used
  fullscreen     - Make the tab full screen
  help           - display this help page
  `
}

export {
  echo, ls, cd, pwd, history, hist,
  su, fullscreen, help
}

