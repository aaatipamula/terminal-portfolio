import { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react'

import Stdout from './components/Stdout.jsx'
import Stdin from './components/Stdin.jsx'
import parse from './utils/parse.js'

/* Persist history across sessions */
const storedHistory = localStorage.getItem("history");

function App() {
  /* Using refs instead of state as components don't need to re-render on update of these properties */
  let histPointer = useRef(0);
  let currCommand = useRef("");
  const stdin = useRef(null);
  const env = useRef({
    history: (storedHistory === null) ? [] : JSON.parse(storedHistory),
    username: "aaatipamula",
    cwd: "/home/aaatipamula",
    filetree: null,
  });

  /* Input and output console state */
  const [stdout, setStdout] = useState([]);
  const [progRunning, setProgRunning] = useState(false);

  const handleStdinSubmit = useCallback(async event => {
    /* Ignore if not an enter */
    if (event.code !== "Enter") return;

    event.preventDefault();

    const input = stdin.current.value.trim();

    /* Clear stdout and end processing */
    switch (input) {
      case "clear":
        setStdout([]);
        stdin.current.value = "";
        return;
    }

    /* Add input to history if non-trival */
    if (input.length != 0) env.current.history.push(input);


    /* Line feed stdin for the stdout */
    const lineFeed = {
      uname: env.current.username,
      cwd: env.current.cwd,
      isActive: false,
      infeed: stdin.current.value
    };

    setStdout([...stdout, lineFeed, ""]);

    setProgRunning(true);
    /* Parse the output of a command given context */
    const output = await parse(input, env.current);
    setProgRunning(false);

    /* Reset the history pointer and the stored command */
    histPointer.current = 0;
    currCommand.current = "";

    /* Update stdout and reset stdin */
    if (output) setStdout([...stdout, lineFeed, output]);
    else setStdout([...stdout, lineFeed]);
    if (stdin.current) stdin.current.value = "";
  }, [stdin, stdout]);

  /* Handle keypresses on app
   * Only re-compute function when stdin is changed
   */
  const handleGlobalKeypress = useCallback(event => {

    if (stdin.current && document.activeElement !== stdin.current) stdin.current.focus();

    /* Line feed stdin for the stdout */
    const lineFeed = {
      uname: env.current.username,
      cwd: env.current.cwd,
      isActive: false,
      infeed: stdin.current.value
    };

    /* Ctrl + C stops processes */
    if (event.ctrlKey && event.code === "KeyC") {
      // Stop some process
      lineFeed.infeed += "^C";
      setStdout([...stdout, lineFeed]);
      stdin.current.value = "";

      /* Tab to refocus input */
    } else if (event.code === "Tab") {
      event.preventDefault();
      if (stdin.current) stdin.current.focus();

      /* Move backwards (up) through history */
    } else if (event.code === "ArrowUp") {
      /* Ignore if there is no history
       * Save the command we are typing if we start going through history
       * Calculate the next index
       * Set stdin to the command we grabbed
       */
      if (env.current.history.length === 0) return;
      else if (histPointer.current === 0) currCommand.current = stdin.current.value;
      let indx = (histPointer.current <= -env.current.history.length) ? histPointer.current : --histPointer.current
      stdin.current.value = env.current.history.at(indx);

      /* Move forward (down) through history */
    } else if (event.code === "ArrowDown") {
      /* Find the next index
       * If we are at the 'start' of the history array, load the saved command we were typing
       * Otherwise load the next command we calculated
       */
      let indx = (histPointer.current >= 0) ? histPointer.current : ++histPointer.current
      if (indx === 0) {
        stdin.current.value = currCommand.current;
      } else stdin.current.value = env.current.history.at(indx);

    }

  }, [stdin, stdout])

  /* Blur when we leave the document
   * Does not need to be re-calculated
   */
  const handleBlur = () => {
    document.body.style.opacity = 0.7;
  }

  /* Focus when we are on the document */
  const handleFocus = (event) => {
    event.preventDefault()
    document.body.style.opacity = 1;
    if (stdin.current) {
      stdin.current.focus();
    }
  }

  /* Add listeners to handle leaving and focusing page
   * Clean up on dismount
   */
  useEffect(() => {
    // Focus on document on load
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    // document.body.addEventListener("click", handleFocus)
    stdin.current.focus();
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      // document.body.removeEventListener("click", handleFocus)

    }
  }, [handleFocus])

  /* Add listener to handle keypresses
   * Clean up on dismount
   * relies on handleKeyPress
   */
  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKeypress);
    stdin.current.addEventListener("keydown", handleStdinSubmit)
    return () => {
      document.removeEventListener("keydown", handleGlobalKeypress);
      stdin.current.removeEventListener("keydown", handleStdinSubmit)
    }
  }, [handleGlobalKeypress, handleStdinSubmit])

  /* Persist our history */
  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(env.current.history))
  }, [env.current.history])

  /* Stay at bottom of page */
  useLayoutEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [stdout])

  return (
    <>
      <Stdout stdout={stdout}/>
      <div id="stdin-wrapper">
        <Stdin
          uname={env.current.username}
          cwd={env.current.cwd}
          stdinRef={stdin}
          isActive={true}
          progRunning={progRunning}
        />
      </div>
    </>
  );
}

export default App

