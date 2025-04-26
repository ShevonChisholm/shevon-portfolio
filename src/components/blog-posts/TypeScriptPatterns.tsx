"use client";

import { Typography } from "@mui/material";
import CodeBlock from "@/components/CodeBlock";

export default function TypeScriptPatterns() {
  return (
    <>
      <Typography variant="h2">TypeScript Design Patterns</Typography>
      <Typography>
        TypeScript enhances JavaScript with a robust type system. Here are some
        essential patterns for writing type-safe React applications.
      </Typography>

      <Typography variant="h2">Props Type Definition</Typography>
      <CodeBlock language="typescript">
        {`interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

function Button({ label, onClick, variant = 'primary', disabled }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={\`btn btn-\${variant}\`}
    >
      {label}
    </button>
  );
}`}
      </CodeBlock>
    </>
  );
}
