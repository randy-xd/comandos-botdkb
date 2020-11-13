const Command = require('../base');

module.exports = class UnknownCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'comando-desconocido',
			group: 'util',
			memberName: 'unknown-command',
			description: 'Muestra información de ayuda para cuando se utiliza un comando desconocido.',
			examples: ['unknown-command kickeverybodyever'],
			unknown: true,
			hidden: true
		});
	}

	run(msg) {
		return msg.reply(
			`el comando es desconocido, por favor use ${msg.anyUsage(
				'help',
				msg.guild ? undefined : null,
				msg.guild ? undefined : null
			)} para ver la lista de comando`
		);
	}
};
