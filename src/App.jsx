import { useState, useEffect } from 'react'
import parse from './parse.js'

const introText = "Hello..."
const PS1 = "[aaatipamula@aniketh.dev ~] -> "

function App() {
  const [stdout, setStdout] = useState("");
  const [stdin, setStdin] = useState(introText);
  const [isAnimate, setAnimate] = useState(true);

  const animating = { 
    animation: `typewriter ${introText.length / 10.83}s steps(${introText.length})`,
    borderRight: ".5em solid"
  };

  function onKeyPress(event) {
    if (event.code === "Backspace") {
      let str = (stdin === PS1) ? stdin : stdin.slice(0, -1)
      setStdin(str)

    } else if (event.code === "Space") {
      setStdin(stdin + ' ')

    } else if (event.code === "Enter") {
      let input = stdin.slice(PS1.length).trim()

      if (input === "clear") {
        setStdout("");
        setStdin(PS1);
        return

      } else if (input === "") {
        setStdout(((stdout.length === 0) ? '' : stdout + '\n') + stdin);
        setStdin(PS1);
        return
      }

      let output = parse(input);
      setStdout(((stdout.length === 0) ? '' : stdout + '\n') + stdin + output);
      setStdin(PS1);

    } else if (event.key.length === 1) {
      setStdin(stdin + event.key)
    } 
  }

  function onAnimateEnd() {
    setAnimate(false);
    setStdout(stdin);
    setStdin(PS1);
  }

  useEffect(() => {
    document.addEventListener("keydown", onKeyPress);
    return () => document.removeEventListener("keydown", onKeyPress)
  }, [stdin])


  return (
    <>
      <pre id="stdout">{stdout}</pre>
      <div className="stdin-wrapper" style={isAnimate ? {border: "none"} : {}}>
        <pre id="stdin" className="stdin" style={isAnimate ? animating : {}} onAnimationEnd={onAnimateEnd}>{stdin}</pre>
      </div>
    </>
  )
}

export default App

