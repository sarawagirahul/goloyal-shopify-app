/* eslint-env node */
import { createRequestHandler } from "@react-router/express";
import express from "express";

const app = express();

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// React Router serves static files from the build/client directory
app.use(
  "/assets",
  express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
);
app.use(express.static("build/client", { maxAge: "1h" }));

app.all(
  "*",
  createRequestHandler({
    build: await import("./build/server/index.js"),
  }),
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
