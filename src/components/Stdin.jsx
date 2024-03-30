import './Stdin.css';

export default function Stdin({ stdin, uname, cwd, isActive }) {
  return (
    <pre className={(isActive) ? "stdin" : "stdout"}>
      <span className="ps1-bracket">[</span>
      <span className="ps1-username">{uname}</span>
      <span className="ps1-at">@</span>
      <span className="ps1-domain">aniketh.dev </span>
      <span className="ps1-cwd">{cwd}</span>
      <span className="ps1-bracket">]</span>
      <span className="ps1-arrow"> -&gt;</span> {stdin}
    </pre>
  )
}

