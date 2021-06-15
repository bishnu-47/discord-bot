function playMusicHandeler(client) {
    // song commmands
    client.player.on('songAdd', (message, queue, song) =>
            message.channel.send(`**${song.name}** has been added to the queue!`))
        .on('songFirst', (message, song) =>
            message.channel.send(`**${song.name}** is now playing!`));


    // handel response messages related to song commands
    client.on('message', async (message) => {
        const args = message.content.slice(process.env.PREFIX.length).trim().split(" ");
        const command = args.shift().toLowerCase();

        try {
            // play response
            if (command === 'play') {
                let song = await client.player.play(message, args.join(' '));

                // If there were no errors the Player#songAdd event will fire and the song will not be null.
                if (song)
                    console.log(`Started playing ${song.name}`);
                return;
            }

            // OR with the Options Object
            if (command === 'play') {
                let song = await client.player.play(message, {
                    search: args.join(' '),
                    requestedBy: message.author.tag
                });

                // If there were no errors the Player#songAdd event will fire and the song will not be null.
                if (song)
                    console.log(`Started playing ${song.name}`);
                return;
            }


            // pause response
            if (command === 'pause') {
                let song = client.player.pause(message);
                if (song)
                    message.channel.send(`${song.name} was paused!`);
            }

            // resume response
            if (command === 'resume') {
                let song = client.player.resume(message);
                if (song)
                    message.channel.send(`${song.name} was resumed!`);
            }

            // set volume
            if (command === 'setvolume') {
                let isDone = client.player.setVolume(message, parseInt(args[0]));
                if (isDone)
                    message.channel.send(`Volume set to ${args[0]}%!`);
            }

            // check play time of song
            if (command === 'progress') {
                let progressBar = client.player.createProgressBar(message, {
                    size: 15,
                    block: '=',
                    arrow: '>'
                });
                if (progressBar)
                    message.channel.send(progressBar);
            }

            // music legend help
            if (command === "help") {
                if (args[0] === "music") {
                    const helpReply = "These are following commands: \n**!play** ***song name***: to play a song\n**!pause**: to pause a song\n**!resume**: to resume a paused song\n**!setvolume** ***0 to 200***\n**!progress**: check progress of song currently playing";

                    message.channel.send(helpReply)
                }
            }

        } catch (e) {
            // check error if client is not joined in any voice channel
            if (e.context === "VoiceChannelTypeInvalid") {
                message.reply("Please join any voice channel then use this command to enjoy your song!")
            } else {
                message.reply("Oops! Something went wrong. Problem will be solved as soon as my sensei notice it. Have a good day till then 😊")
                console.log(e)
            }
        }
    });
}

module.exports = playMusicHandeler