import { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react'

import Stdout from './components/Stdout.jsx'
import Stdin from './components/Stdin.jsx'
import parse from './api/parse.js'

/* Persist history across sessions */
const storedHistory = localStorage.getItem("history");

function App() {
  /* Using refs instead of state as components don't need to re-render on update of these properties */
  let histPointer = useRef(0);
  let currCommand = useRef("");
  const env = useRef({
    history: (storedHistory === null) ? [] : JSON.parse(storedHistory),
    username: "aaatipamula",
    cwd: "~"
  });

  /* Input and output console state */
  const [stdout, setStdout] = useState([]);
  const [stdin, setStdin] = useState("");

  /* Handle keypresses on app
   * Only re-compute function when stdin is changed */
  const handleKeyPress = useCallback(event => {
    event.preventDefault();
    // Create an object to as props for Stdin (yummy curry)
    const lineFeed = (content) => ({
      uname: env.current.username,
      cwd: env.current.cwd,
      stdin: content,
      isActive: false
    })

      /* Ctrl + C stops processes */
    if (event.ctrlKey && event.code === "KeyC") {
      // Stop some process
      setStdout([...stdout, lineFeed(stdin + "^C")]);
      setStdin("")
      return;

      /* Actually remove the last character of stdin */
    } else if (event.code === "Backspace") {
      setStdin(stdin.slice(0, -1));

      /* Handle submitting a command */
    } else if (event.code === "Enter") {
      const input = stdin.trim();

      /* Clear stdout and end processing */
      switch (input) {
        case "clear":
          setStdout([]);
          setStdin("");
          return;
      }

      /* Add input to history if non-trival */
      if (input.length != 0) env.current.history.push(input);

      /* Parse the output of a command given context */
      const output = parse(input, env.current);

      /* Reset the history pointer and the stored command */
      histPointer.current = 0;
      currCommand.current = "";

      /* Update stdout and reset stdin */
      if (output) setStdout([...stdout, lineFeed(stdin), output]);
      else setStdout([...stdout, lineFeed(stdin)]);
      setStdin("");

      /* Move backwards (up) through history */
    } else if (event.code === "ArrowUp") {
      /* Ignore if there is no history
       * Save the command we are typing if we start going through history
       * Calculate the next index
       * Set stdin to the command we grabbed */
      if (env.current.history.length === 0) return;
      else if (histPointer.current === 0) currCommand.current = stdin;
      let indx = (histPointer.current <= -env.current.history.length) ? histPointer.current : --histPointer.current
      setStdin(env.current.history.at(indx));

      /* Move forward (down) through history */
    } else if (event.code === "ArrowDown") {
      /* Find the next index
       * If we are at the 'start' of the history array, load the saved command we were typing
       * Otherwise load the next command we calculated */
      let indx = (histPointer.current >= 0) ? histPointer.current : ++histPointer.current
      if (indx === 0) {
        setStdin(currCommand.current);
        return;
      }
      setStdin(env.current.history.at(indx));

      /* If its a single character we can just input it */
    } else if (event.key.length === 1) {
      setStdin(stdin + event.key);
    } 

  }, [stdin])

  /* Blur when we leave the document
   * Does not need to be re-calculated */
  const handleBlur = useCallback(() => {
    document.body.style.opacity = 0.7;
  }, [])

  /* Focus when we are on the document
   * Does not need to be re-calculated */
  const handleFocus = useCallback(() => {
    document.body.style.opacity = 1;
  }, [])

  /* Add listeners to handle leaving and focusing page
   * Clean up on dismount
   * Does not need to be re-calculated */
  useEffect(() => {
    // Focus on document on load
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);

    }
  }, [])

  /* Add listener to handle keypresses
   * Clean up on dismount
   * relies on handleKeyPress */
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress])

  /* Persist our history */
  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(env.current.history))
  }, [env.current.history])

  /* Stay at bottom of page */
  useLayoutEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [stdout, stdin])


  return (
    <>
      <Stdout stdout={stdout}/>
      <div id="stdin-wrapper">
        <Stdin
          stdin={stdin}
          uname={env.current.username}
          cwd={env.current.cwd}
          isActive={true}
        />
      </div>
    </>
  );
}

export default App

