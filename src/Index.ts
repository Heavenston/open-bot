import * as mongoose from "mongoose";

if (typeof process.env.databaseAdress !== "string") throw "Database address isn't a string";
mongoose.connect(process.env.databaseAdress, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log("Connected to database");
}).catch(e => {
  console.error("Error while connecting to database",e);
  process.exit(0);
});