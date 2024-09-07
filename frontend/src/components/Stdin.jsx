import './Stdin.css';

/**
 * @typedef { import('react').MutableRefObject }
 */

/**
 * @typedef { Object } StdinProps
 * @property { MutableRefObject<HTMLInputElement | null> } stdinRef
 * @property { string } uname
 * @property { string } cwd
 * @property { string } infeed
 * @property { boolean } isActive
 * @property { boolean } progRunning
 */

/**
 * @param { StdinProps } props
 */
function Stdin({ stdinRef, infeed, uname, cwd, isActive, progRunning }) {

  const outval = (isActive) ? <input id="stdin" type="text" ref={stdinRef}/> : infeed
  const path = cwd.replace(`/home/${uname}`, "~");

  return (
    <pre 
      className={(isActive) ? "stdin" : "stdout"}
      style={{ display: (isActive && progRunning) ? 'none' : 'flex' }}
    >
      <span className="ps1-bracket">[</span>
      <span className="ps1-username">{uname}</span>
      <span className="ps1-at">@</span>
      <span className="ps1-domain">aniketh.dev </span>
      <span className="ps1-cwd">{path}</span>
      <span className="ps1-bracket">]</span>
      <span className="ps1-arrow"> &gt; </span>
      {outval}
    </pre>
  )
}

export default Stdin

