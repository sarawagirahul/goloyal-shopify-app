import express from "express";
import { createRequestHandler } from "@react-router/express";
import * as build from "./build/server/index.js";

const app = express();

// Static assets
app.use(express.static("build/client"));

// React Router request handling
app.all(
  "*",
  createRequestHandler({
    build,
  })
);

// REQUIRED for Render
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`GoLoyal server listening on port ${port}`);
});
