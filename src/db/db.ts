import * as mongoose from "mongoose";
import { EventEmitter } from "events";

export class Db extends EventEmitter {
  private _ready: boolean = false;
  get ready(): boolean {
    return this._ready;
  }

  constructor() {
    super();

    if (typeof process.env.databaseAdress !== "string")
      throw "Database Adress is not a string";
    console.log("Connecting to database");
    mongoose.connect(process.env.databaseAdress, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
      console.log("Connected to database");
      this._ready = true;
      this.emit("ready");
    }).catch(e => {
      console.error("Error while connecting to database",e);
      process.exit(0);
    });
  }
}
const db = new Db();
export default db;