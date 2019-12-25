import * as mongoose from "mongoose";
import * as Discord from "discord.js";

export interface IGuildMemberDocument extends mongoose.Document {
  xp: number;
  guildId: string;
  id: string;
}

const schema = new mongoose.Schema({
  xp: {type: Number, required: true, default: 0},
  guildId: {type: String, required: true},
  id: {type: String, required: true},
});
const model = mongoose.model<IGuildMemberDocument>("GuildMember", schema, "GuildMembers");

export async function fromIds(guildId: string, id: string): Promise<IGuildMemberDocument> {
  const doc = await model.findOne({guildId, id}).exec();
  if (doc)
    return doc;

  return new model({
    guildId,
    id
  });
}
export async function fromGuildMember(member: Discord.GuildMember): Promise<IGuildMemberDocument> {
  return await fromIds(member.guild.id, member.id);
}