'use client';

import { Box } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  children: string;
  language: string;
}

export default function CodeBlock({ children, language }: CodeBlockProps) {
  return (
    <Box sx={{ my: 2 }}>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          borderRadius: '8px',
          padding: '1rem',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </Box>
  );
} 