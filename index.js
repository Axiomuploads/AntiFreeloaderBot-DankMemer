const { Client, GatewayIntentBits, Partials, ActivityType, EmbedBuilder } = require('discord.js');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.GuildMember]
});

let currentStatusIndex = 0;

client.once('ready', () => {
       updateStatus();
  setInterval(updateStatus, 5000); // Rotate status every 5 seconds
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  if (message.mentions.has(client.user) && !message.content.startsWith(config.prefix)) {
    const embed = new EmbedBuilder()
      .setColor('#ffffff')
      .setTitle('Bot Prefix')
      .setDescription(`My prefix is ${config.prefix}! I'm a private bot that is opensource here: https://github.com/Axiomuploads/AntiFreeloaderBot-DankMemer`)
      .setImage('https://cdn.discordapp.com/attachments/1264368096186077214/1266569093344137287/Untitled115_20240727093309.png');
    return message.channel.send({ embeds: [embed] });
  }

  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (message.author.id !== config.ownerId) {
    return message.reply('You do not have permission to use this command.');
  }

  if (command === 'toggle') {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Antifreeloader System')
    if (args[0] === 'enable') {
      config.antifreeloaderEnabled = true;
      embed.setDescription('Antifreeloader system enabled.') 
    } else if (args[0] === 'disable') {
      config.antifreeloaderEnabled = false;
      embed.setDescription('Antifreeloader system disabled.')
    } else {
      embed.setDescription(`Usage: ${config.prefix}toggle <enable|disable>`);
    }
    message.channel.send({ embeds: [embed] });
  }

  if (command === 'restart') {
    await message.channel.send('Shutting down bot...');
    client.user.setPresence({
      activities: [{ name: 'Shutting down bot...', type: ActivityType.Watching }],
      status: 'dnd'
    });
    process.exit();
  }

  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Bot Commands')
      .setDescription('{p}toggle <enable|disable>');
    message.channel.send({ embeds: [embed] });
  }
});

client.on('guildMemberRemove', async (member) => {
  if (config.antifreeloaderEnabled) {
    try {
      const logChannel = await client.channels.fetch(config.logChannelId);
      const banMessage = `User banned for freeloading: ${member.user.tag}`;
      await member.ban({ reason: 'Anti-Freeloader System is enabled' });

      if (logChannel) {
        logChannel.send(banMessage);
      }

      client.user.setPresence({
        activities: [{ name: `Banning ${member.user.tag}`, type: ActivityType.Watching }],
        status: 'dnd'
      });

      // Restore status after a short delay
      setTimeout(updateStatus, 30000);

    } catch (error) {
      console.error(`Failed to ban user ${member.user.tag}:`, error);
    }
  }
});

async function updateStatus() {
  try {
    const guild = client.guilds.cache.get('1235532353913229313'); // Replace with your guild ID
    if (guild) {
      await guild.members.fetch(); // Fetch all members to get an accurate count
      const memberCount = guild.memberCount;
      const statuses = [
        { name: `Update this at line 111-114 ${memberCount}`, type: ActivityType.Watching },
        { name: 'Update this at line 111-114', type: ActivityType.Watching },
        { name: 'Update this at line 111-114', type: ActivityType.Watching }
      ];
      const status = statuses[currentStatusIndex];
      client.user.setPresence({ activities: [status], status: 'idle' });
      currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
    }
  } catch (error) {
    console.error('Failed to update status
