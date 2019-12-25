import * as Discord from "discord.js";
import * as GuildDb from "./db/guildDb";
import * as commandHandler from "./discord/commandHandler";

export const client = new Discord.Client();
client.login(process.env.discordToken);

client.on("ready", () => {
  console.log("Connected to discord");
});

client.on("message",async mess => {
  if (mess.author.id === client.user.id) return;

  if (mess.channel.type === "text") {
    const guildDb = await GuildDb.fromId(mess.guild.id);

    const prefix = guildDb.prefix;
    if (!mess.content.startsWith(prefix)) return;
    const args = mess.content
      .substring(prefix.length)
      .split(" ")
      .filter(arg => !!arg);
    const name = args.shift();
    if (!name) throw "Unexpected Error";

    const cmd: commandHandler.ICommand = {
      name,
      args,
      guild: mess.guild,
      message: mess
    };

    commandHandler.execCommand(cmd);
}
});