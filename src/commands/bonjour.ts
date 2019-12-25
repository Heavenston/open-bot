import * as CommandHandler from "../discord/commandHandler";

export const config: CommandHandler.ICommandExecutorConfig = {
  argsTypes: []
};

export function run(cmd: CommandHandler.ICommandContext): CommandHandler.ICommandOutput {
  return {
    message: "Salut !"
  };
}