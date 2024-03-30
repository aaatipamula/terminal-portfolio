import { useState, useEffect, useCallback } from 'react'

import Stdout from './components/Stdout.jsx'
import Stdin from './components/Stdin.jsx'
import parse from './api/parse.js'

function App() {
  // TODO: Set history pointer
  const [history, setHistory] = useState([])
  const [username, setUsername] = useState("aaatipamula");
  const [cwd, setCwd] = useState("~");
  const [stdout, setStdout] = useState([]);
  const [stdin, setStdin] = useState("");

  const env = Object.create(null);
  env.cwd = cwd;
  env.history = history;
  env.username = username;
  env.setDir = setCwd;
  env.setHist = setHistory;
  env.setUser = setUsername;

  const handleKeyPress = useCallback(event => {
    // TODO: History and up/down arrows
    if (event.code === "Backspace") {
      setStdin(stdin.slice(0, -1));

    } else if (event.code === "Space") {
      setStdin(stdin + ' ');

    } else if (event.code === "Enter") {
      const input = stdin.trim();

      // TODO: Handle Ctrl+key combos
      switch (input) {
        case "clear":
          setStdout([]);
          setStdin("");
          return;
      }

      if (input !== "") setHistory([...history, input]);

      const output = parse(input, env);
      const lineFeed = (
        <pre className="ps1" key={crypto.randomUUID()}>
          <span className="ps1-bracket">[</span>
          <span className="ps1-username">{username}</span>
          <span className="ps1-at">@</span>
          <span className="ps1-domain">aniketh.dev </span>
          <span className="ps1-cwd">{cwd}</span>
          <span className="ps1-bracket">]</span> -&gt; {input}
        </pre>
      )
      // TODO: Automatic scroll to bottom
      setStdout([...stdout, lineFeed, output]);
      setStdin("");

    } else if (event.code === "ArrowUp") {
      setStdin(history[--histPointer]);
    } else if (event.code === "ArrowDown") {
      setStdin(history[++histPointer]);
    } else if (event.key.length === 1) {
      setStdin(stdin + event.key);
    } 
  }, [stdin, stdout, cwd, history, username, env])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress])


  return (
    <>
      <Stdout stdout={stdout}/>
      <Stdin stdin={stdin} username={username} cwd={cwd}/>
    </>
  );
}

export default App

