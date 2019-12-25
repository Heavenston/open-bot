import * as mongoose from "mongoose";

export interface IGuildDocument extends mongoose.Document {
  id: string;
  prefix: string;
}

const schema = new mongoose.Schema({
  id: {type: String, required: true, unique: true},
  prefix: {type: String, required: true},
});
const model = mongoose.model<IGuildDocument>("Guild", schema, "Guilds");

export async function fromId(id: string): Promise<IGuildDocument> {
  const doc = await model.findOne({id}).exec();
  if (doc) {
    return doc;
  }

  return new model({
    prefix: "$",
    id
  });
}