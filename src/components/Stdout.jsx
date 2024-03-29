export default function Stdout({ stdout }) {
  const output = stdout.map(item => 
    (typeof(item) === 'string') ? <pre key={crypto.randomUUID()}>{item}</pre> : item
  )
  return (
    <div id="stdout-wrapper">{output}</div>
  )
}
