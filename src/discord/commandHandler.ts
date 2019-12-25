import * as Discord from "discord.js";

export interface ICommand {
  name: string;
  args: string[];
  message?: Discord.Message;
  guild: Discord.Guild;
}

const enum ArgTypes {
  string,
  int,
  float,
  member,
}
export type argType = ArgTypes|{type: ArgTypes, required: boolean};
export type argTypes = argType|argType[];

export interface ICommandExecutorConfig {
  argsTypes?: argTypes[];
}
export interface ICommandExecutor {
  run(cmd: ICommandContext): ICommandOutput|Promise<ICommandOutput>;
  config?: ICommandExecutorConfig;
}

export interface ICommandContext extends ICommand {
}

export async function parseArg(arg: string, type: argTypes, command: ICommand): Promise<{value: any, type: argType}[]> {
  const values: {value: string|number|Discord.GuildMember|null, type: argType}[] = [];
  if (type instanceof Array) {
    for (const t of type) {
      values.push(...await parseArg(arg, t, command));
    }
  }
  else {
    const realType: ArgTypes = typeof type === "object" ? type.type : type;
    let value: string|number|Discord.GuildMember|null = null;

    switch (realType) {
      case ArgTypes.member:
        if (command.guild.members.has(arg))
          value = command.guild.members.get(arg) as Discord.GuildMember;
        else {
          const re = (/@!?([0-9]{18})>/g).exec(arg);
          if (re) {
            const id = re[1];
            const member = await command.guild.fetchMember(id);
            if (member)
              value = member;
          }
        }
        break;
      case ArgTypes.float:
        value = Number.parseFloat(arg) || null;
        break;
      case ArgTypes.int:
        value = Number.parseInt(arg) || null;
        break;
      case ArgTypes.string:
        value = arg;
        break;
    }

    values.push({
      value: value,
      type: realType
    });

  }

  return values;
}

export enum CommandExecutionErrors {
  requiredArgumentNotProvided,
  couldNotParseArgument,
  typeNotSuportedWithoutAMessage
}
export interface ICommandExecutionError {
  type: CommandExecutionErrors;
  argIndex: number;
  arg: string|null;
  expectedType: argTypes;
}

export async function execCommand(cmd: ICommand): Promise<ICommandExecutionError|void> {
  const c = require(`../commands/${cmd.name.toLowerCase()}`) as ICommandExecutor;

  const parsedArgs: any[] = [];
  if (c.config?.argsTypes) {
    for (const i in c.config.argsTypes) {
      if (!cmd.args[i]) {
        return {
          type: CommandExecutionErrors.requiredArgumentNotProvided,
          argIndex: Number(i),
          arg: null,
          expectedType: c.config.argsTypes[i]
        };
      }

      const values = await parseArg(
        cmd.args[i],
        c.config.argsTypes[i],
        cmd);

      const value = values.find(v => v.value !== null);
      if (!value) {
        return {
          type: CommandExecutionErrors.couldNotParseArgument,
          argIndex: Number(i),
          arg: cmd.args[i],
          expectedType: c.config.argsTypes[i]
        };
      }
      parsedArgs[i] = value;
    }
  }

  const context: ICommandContext = { ...cmd };
  if (c.config?.argsTypes) context.args = parsedArgs;

  let r = c.run(context);
  if (r instanceof Promise) r = await r;
  if (cmd.message)
    replyToMessage(cmd.message, r.message, r.color);
}

export interface ICommandOutput {
  message: string;
  color?: number;
}

async function replyToMessage(message: Discord.Message, text: string, color: number = 0x00FF00) {
  const embed = new Discord.RichEmbed();

  embed.color = color;

  embed.description = text;

  embed.author = {
    name: message.guild.me.displayName,
    icon_url: message.client.user.avatarURL
  };
  embed.footer = {
    text: message.member.displayName,
    icon_url: message.author.avatarURL,
  };

  await message.channel.send(embed);
}