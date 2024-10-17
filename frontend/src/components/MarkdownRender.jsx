import ReactMarkdown from 'react-markdown';

/**
 * @param {{ text: string }}
 */
function MarkdownRenderer({ text }) {
  return (
    <ReactMarkdown
      disallowedElements={['br']}
      components={{
        p: ({ node, ...props }) => <pre {...props}/>,
        a: ({ node, ...props }) => <a rel="noopener noreferrer" target="_blank" {...props}/>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export default MarkdownRenderer;

