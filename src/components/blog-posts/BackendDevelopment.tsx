"use client";

import { Typography } from "@mui/material";
import CodeBlock from "@/components/CodeBlock";

export default function BackendDevelopment() {
  return (
    <>
      <Typography variant="h2">Modern Backend Development</Typography>
      <Typography>
        Modern backend development encompasses a wide range of technologies and
        practices. This guide focuses on building scalable APIs using Node.js
        and Express.
      </Typography>

      <Typography variant="h2">Basic Express Server Setup</Typography>
      <CodeBlock language="typescript">
        {`import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`}
      </CodeBlock>
    </>
  );
}
