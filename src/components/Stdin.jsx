import './Stdin.css';

export default function Stdin({ stdin, username, cwd }) {

  return (
    <div id="stdin-wrapper">
      <pre className="ps1" id="ps1">
        <span className="ps1-bracket">[</span>
        <span className="ps1-username">{username}</span>
        <span className="ps1-at">@</span>
        <span className="ps1-domain">aniketh.dev </span>
        <span className="ps1-cwd">{cwd}</span>
        <span className="ps1-bracket">]</span>
      </pre>
      <pre id="stdin" className="stdin"> -&gt; {stdin}</pre>
    </div>
  )
}

