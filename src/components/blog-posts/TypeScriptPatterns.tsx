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

      <Typography variant="h2">Generic Components</Typography>
      <Typography>
        Use generics to make components reusable for different data types.
      </Typography>
      <CodeBlock language="typescript">
        {`interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((item, idx) => <li key={idx}>{renderItem(item)}</li>)}</ul>;
}

// Usage:
<List<string>
  items={["apple", "banana"]}
  renderItem={fruit => <span>{fruit.toUpperCase()}</span>}
/>`}
      </CodeBlock>

      <Typography variant="h2">Utility Types</Typography>
      <Typography>
        Leverage built-in utility types like Partial, Pick, and Omit for concise
        transformations.
      </Typography>
      <CodeBlock language="typescript">
        {`interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

// Make all properties optional
type PartialUser = Partial<User>;
// Pick only id and name
type UserSummary = Pick<User, 'id' | 'name'>;
// Omit sensitive fields
type SafeUser = Omit<User, 'email' | 'isAdmin'>;
`}
      </CodeBlock>

      <Typography variant="h2">Discriminated Unions</Typography>
      <Typography>
        Use unions with a common discriminant to model variants with exhaustive
        type checks.
      </Typography>
      <CodeBlock language="typescript">
        {`type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number };

function area(shape: Shape) {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
    default:
      // Ensure all cases are handled
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
`}
      </CodeBlock>

      <Typography variant="h2">Type Guards</Typography>
      <Typography>
        Narrow down types at runtime with custom guard functions.
      </Typography>
      <CodeBlock language="typescript">
        {`function isDate(value: any): value is Date {
  return value instanceof Date;
}

function process(input: string | Date) {
  if (isDate(input)) {
    console.log(input.toISOString());
  } else {
    console.log(input.trim());
  }
}
`}
      </CodeBlock>

      <Typography variant="h2">Polymorphic Components</Typography>
      <Typography>
        Build components that can render as different HTML elements while
        preserving props.
      </Typography>
      <CodeBlock language="typescript">
        {`import React from 'react';

interface TextProps<E extends React.ElementType> {
  as?: E;
  children: React.ReactNode;
}

type PolymorphicText = <E extends React.ElementType = 'span'>(
  props: TextProps<E> & Omit<React.ComponentProps<E>, keyof TextProps<E>>
) => React.ReactElement | null;

const Text: PolymorphicText = ({ as: Component = 'span', children, ...rest }) => {
  return <Component {...rest}>{children}</Component>;
};

// Usage:
<Text as="h1" style={{ fontWeight: 'bold' }}>Heading</Text>
`}
      </CodeBlock>

      <Typography variant="h2">Context API Pattern</Typography>
      <Typography>
        Strongly type context values and providers for predictable usage.
      </Typography>
      <CodeBlock language="typescript">
        {`interface AuthContextType {
  user: { id: number; name: string } | null;
  login: (username: string, password: string) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<{ id: number; name: string } | null>(null);

  const login = async (u: string, p: string) => {
    // ...auth logic
    setUser({ id: 1, name: u });
  };

  return <AuthContext.Provider value={{ user, login }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
`}
      </CodeBlock>

      <Typography variant="h2">Render Props Pattern</Typography>
      <Typography>
        Pass a render function to share common logic while customizing UI.
      </Typography>
      <CodeBlock language="typescript">
        {`interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(json => setData(json))
      .finally(() => setLoading(false));
  }, [url]);

  return <>{children(data, loading)}</>;
}

// Usage:
<DataFetcher<{ name: string }> url="/api/user">
  {(user, loading) =>
    loading ? <p>Loading...</p> : <p>User: {user?.name}</p>
  }
</DataFetcher>
`}
      </CodeBlock>

      <Typography variant="h2">Higher-Order Components</Typography>
      <Typography>
        Wrap components to inject props or behavior while preserving types.
      </Typography>
      <CodeBlock language="typescript">
        {`function withTimestamp<P>(Component: React.ComponentType<P>) {
  return (props: P) => <Component {...props} timestamp={Date.now()} />;
}

// Usage:
interface WidgetProps {
  title: string;
  timestamp?: number;
}

function Widget({ title, timestamp }: WidgetProps) {
  return (
    <div>
      <h3>{title}</h3>
      <small>{timestamp}</small>
    </div>
  );
}

export const TimedWidget = withTimestamp(Widget);
`}
      </CodeBlock>
    </>
  );
}
