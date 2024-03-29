import { useState, useEffect } from 'react'

import Stdout from './components/Stdout.jsx'
import Stdin from './components/Stdin.jsx'
import parse from './api/parse.js'

function App() {
  const [username, setUsername] = useState("aaatipamula");
  const [cwd, setCwd] = useState("~");
  const [stdout, setStdout] = useState([]);
  const [stdin, setStdin] = useState("");

  function handleKeyPress(event) {
    if (event.code === "Backspace") {
      setStdin(stdin.slice(0, -1));

    } else if (event.code === "Space") {
      setStdin(stdin + ' ');

    } else if (event.code === "Enter") {
      let input = stdin.trim();

      // TODO: Create a stdin/out "API" object
      // TODO: Handle Ctrl+key combos
      // Move to bins
      if (input === "clear") {
        setStdout([]);
        setStdin("");
        return;
      }

      let output = parse(input);
      // Consider swaping out nbsp
      let lineFeed = (
        <pre className="ps1" key={crypto.randomUUID()}>
          <span className="ps1-bracket">[</span>
          <span className="ps1-username">{username}</span>
          <span className="ps1-at">@</span>
          <span className="ps1-domain">aniketh.dev </span>
          <span className="ps1-cwd">{cwd}</span>
          <span className="ps1-bracket">]</span> {input}
        </pre>
      )
      setStdout([...stdout, lineFeed, output]);
      setStdin("");

    } else if (event.key.length === 1) {
      setStdin(stdin + event.key);
    } 
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [stdin])


  return (
    <>
      <Stdout stdout={stdout}/>
      <Stdin stdin={stdin} username={username} cwd={cwd}/>
    </>
  );
}

export default App

