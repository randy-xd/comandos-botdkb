const { stripIndents, oneLine } = require('common-tags');
const Command = require('../base');
const { disambiguation } = require('../../util');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'util',
			cooldowns: 10,
			memberName: 'help',
			aliases: ['h','hp'],
			description: 'ayuda en especifica comandos ',
			details: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
			examples: ['help', 'help prefix'],
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Which command would you like to view the help for?',
					type: 'string',
					default: ''
				}
			]
		});
	}

	async run(msg, args) { // eslint-disable-line complexity
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'all';
		if(args.command && !showAll) {
			if(commands.length === 1) {
				let help = stripIndents`
					${oneLine`
						__Command **${commands[0].name}**:__ ${commands[0].description}
						${commands[0].guildOnly ? ' (Usable only in servers)' : ''}
						${commands[0].nsfw ? ' (NSFW)' : ''}
					`}

					**Format:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
				`;
				if(commands[0].aliases.length > 0) help += `\n**Aliases:** ${commands[0].aliases.join(', ')}`;
				help += `\n${oneLine`
					**Group:** ${commands[0].group.name}
					(\`${commands[0].groupID}:${commands[0].memberName}\`)
				`}`;
				if(commands[0].details) help += `\n**Details:** ${commands[0].details}`;
				if(commands[0].examples) help += `\n**Examples:**\n${commands[0].examples.join('\n')}`;

				const messages = [];
				try {
					messages.push(await msg.direct(help));
					if(msg.channel.type !== 'dm') messages.push(await msg.reply('Te envió un DM con información..'));
				} catch(err) {
					messages.push(await msg.reply('No puedo enviarle el DM de ayuda.  Probablemente tengas DM desactivados.'));
				}
				return messages;
			} else if(commands.length > 15) {
				return msg.reply('Se encontraron varios comandos.  Por favor sé más específico.');
			} else if(commands.length > 1) {
				return msg.reply(disambiguation(commands, 'commands'));
			} else {
				return msg.reply(
					`No se puede identificar el comando.  Utilizar${msg.usage(
						null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
					)} para ver la lista de todos los comandos.`
				);
			}
		} else {
			const messages = [];
			try {
				messages.push(await msg.direct(stripIndents`
					${oneLine`
						Para ejecutar un comando en ${msg.guild ? msg.guild.name : 'cualquier servidor'},
						use ${Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
						For example, ${Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
					`}
					Para ejecutar un comando en este DM, simplemente use ${Command.usage('command', null, null)} sin prefix.

				  use ${this.usage('<command>', null, null)} para ver información detallada sobre un comando específico.
					use ${this.usage('all', null, null)} to ver una lista de *all* los comandos, no solo los disponibles.

					__**${showAll ? 'All commands' : `Comandos disponibles en ${msg.guild || 'este DM'}`}**__

					${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))))
						.map(grp => stripIndents`
							__${grp.name}__
							${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))
								.map(cmd => `**${cmd.name}:** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')
							}
						`).join('\n\n')
					}
				`, { split: true }));
				if(msg.channel.type !== 'dm') messages.push(await msg.reply('Te envió un DM con información.'));
			} catch(err) {
				messages.push(await msg.reply('No puedo enviarle el DM de ayuda.  Probablemente tengas DM desactivados.'));
			}
			return messages;
		}
	}
};
