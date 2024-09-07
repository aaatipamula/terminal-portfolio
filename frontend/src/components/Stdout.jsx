import Stdin from "./Stdin"
import MarkdownRenderer from "./MarkdownRender"

/**
 * @typedef { import('./Stdin').StdinProps } StdinItem
 */

/**
 * @param {{ stdout: (StdinItem | string)[] }}
 */
function Stdout({ stdout }) {
  const output = stdout.map(item => {
    if (typeof(item) === 'string')
      return <MarkdownRenderer key={crypto.randomUUID()} text={item}/>
    return <Stdin {...item} key={crypto.randomUUID()}/>
  });

  return (
    <div id="stdout-wrapper">{output}</div>
  )
}

export default Stdout
