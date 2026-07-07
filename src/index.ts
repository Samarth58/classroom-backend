import AgentAPI from "apminsight";
AgentAPI.config();

import app from "./app.js";

const PORT = process.env.PORT || 8000;

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});