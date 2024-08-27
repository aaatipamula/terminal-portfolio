import Stdin from "./Stdin"

/**
 * @typedef { import('./Stdin').StdinProps } StdinItem
 */

/**
 * @param {{ stdout: (StdinItem | string)[] }}
 */
function Stdout({ stdout }) {
  const output = stdout.map(item => {
    if (typeof(item) === 'string')
      return <pre key={crypto.randomUUID()}>{item}</pre>;
    return <Stdin {...item} key={crypto.randomUUID()}/>
  });

  return (
    <div id="stdout-wrapper">{output}</div>
  )
}

export default Stdout
