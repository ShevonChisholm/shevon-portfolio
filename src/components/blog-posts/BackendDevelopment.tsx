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

      <Typography variant="h2">Environment Configuration</Typography>
      <Typography>
        To keep sensitive data secure and manage different environments
        (development, staging, production), use environment variables. Tools
        like dotenv allow you to load variables from a .env file.
      </Typography>
      <CodeBlock language="typescript">
        {`// .env
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mydb

// src/server.ts
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3000;`}
      </CodeBlock>

      <Typography variant="h2">Connecting to MongoDB with Mongoose</Typography>
      <Typography>
        Mongoose provides a straightforward, schema-based solution to model your
        application data and includes built-in type casting, validation, query
        building, and business logic hooks.
      </Typography>
      <CodeBlock language="typescript">
        {`import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URI!, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));`}
      </CodeBlock>

      <Typography variant="h2">Error Handling Middleware</Typography>
      <Typography>
        Centralizing error handling helps maintain clean and readable code.
        Create custom error handlers to catch and respond to errors in a
        consistent format.
      </Typography>
      <CodeBlock language="typescript">
        {`// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
}

// In your server setup:
app.use(errorHandler);`}
      </CodeBlock>

      <Typography variant="h2">Testing with Jest and Supertest</Typography>
      <Typography>
        Automated tests ensure your API behaves as expected. Jest is a powerful
        testing framework, and Supertest makes HTTP assertions easy.
      </Typography>
      <CodeBlock language="typescript">
        {`import request from 'supertest';
import app from './server';

describe('GET /api/health', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});`}
      </CodeBlock>

      <Typography variant="h2">Deployment with Docker</Typography>
      <Typography>
        Containerizing your application ensures consistency across environments.
        A simple Dockerfile can package your Node.js server.
      </Typography>
      <CodeBlock language="dockerfile">
        {`# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["node", "dist/server.js"]`}
      </CodeBlock>
    </>
  );
}
