import './Stdin.css';

function Stdin({ stdinRef, infeed, uname, cwd, isActive }) {

  const outval = (isActive) ? <input id="stdin" type="text" ref={stdinRef}/> : infeed

  return (
    <pre className={(isActive) ? "stdin" : "stdout"}>
      <span className="ps1-bracket">[</span>
      <span className="ps1-username">{uname}</span>
      <span className="ps1-at">@</span>
      <span className="ps1-domain">aniketh.dev </span>
      <span className="ps1-cwd">{cwd}</span>
      <span className="ps1-bracket">]</span>
      <span className="ps1-arrow"> &gt; </span>
      {outval}
    </pre>
  )
}

export default Stdin

