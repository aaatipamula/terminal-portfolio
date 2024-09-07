import Stdin from "./Stdin"
import Markdown from "react-markdown";

/**
 * @typedef { import('./Stdin').StdinProps } StdinItem
 */

/**
 * @param {{ stdout: (StdinItem | string)[] }}
 */
function Stdout({ stdout }) {
  const output = stdout.map(item => {
    if (typeof(item) === 'string')
      return <pre key={crypto.randomUUID()}><Markdown>{item}</Markdown></pre>;
    return <Stdin {...item} key={crypto.randomUUID()}/>
  });

  return (
    <div id="stdout-wrapper">{output}</div>
  )
}

export default Stdout
