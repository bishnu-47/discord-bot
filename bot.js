require("dotenv").config()
const playMusicHandeler = require("./music.js")

// Discord setup
const Discord = require("discord.js");
const client = new Discord.Client();

// music player setup
const { Player } = require("discord-music-player")
const player = new Player(client, {
    quality: "high"
})
client.player = player;


// events
client.once("ready", () => {
    console.log(`${client.user.tag}, ready to serve!`)
})

client.on("message", msg => {
    if (msg.author.bot) return;

    if (msg.content === "hi") {
        msg.reply("Hello there!")
    }
    if (msg.content === `${process.env.PREFIX}server`) {
        msg.channel.send(`Server Name: ${msg.guild.name} \nTotal members: ${msg.guild.memberCount}`)
    }
})

client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
    if (!channel) return;
    channel.send(`Welcome to the server, ${member}`);
});

// music related code
playMusicHandeler(client)

client.once("disconnect", () => {
    console.log("Bot disconnected!")
})

client.login(process.env.BOT_TOKEN)