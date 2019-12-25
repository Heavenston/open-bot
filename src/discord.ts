import * as Discord from "discord.js";
import * as GuildDb from "./db/guildDb";

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
    const command = args.shift();

    if (command === "bonjour") {
      mess.reply("Salut !");
    }

    else if (command === "stop") {
      client.destroy().then(() => {
        process.exit(0);
      });
    }
}
});