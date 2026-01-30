import express from "express";
import { handleRequest } from "./build/server/index.js";

const app = express();

app.all("/*", async (req, res) => {
  try {
    const response = await handleRequest(req);
    res.status(response.status).send(response.body);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
