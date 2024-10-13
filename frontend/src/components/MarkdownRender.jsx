import React from 'react';
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
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;

