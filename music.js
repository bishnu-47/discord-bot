function playMusicHandeler(client) {
  let isSeeked = false;

  // song commmands
  client.player.on("songAdd", (message, queue, song) => {
    return message.channel.send(
      `**${song.name}** has been added to the queue! on request of **${message.author.tag}**`
    );
  });

  client.player.on("songFirst", (message, song) => {
    if (isSeeked) {
      isSeeked = false;
      return;
    }
    return message.channel.send(
      `Started playing ${song.name}, on request of **${message.author.tag}**`
    );
  });

  // handle response messages related to song commands
  client.on("message", async (message) => {
    // early return if message is sent by bot or command prefix is incorrect
    if (message.author.bot) return;
    if (message.content[0] !== "!") {
      return;
    }

    const args = message.content
      .slice(process.env.PREFIX.length)
      .trim()
      .split(/ +/g);
    console.log(args);
    const command = args.shift().toLowerCase();

    try {
      // play response
      if (command === "play") {
        // if already a song is playing add it the queue
        playSong(client, message, args);
      }

      // pause response
      if (command === "pause") {
        pauseSong(client, message);
      }

      // resume response
      if (command === "resume") {
        resumeSong(client, message);
      }

      // seek the music specified secs
      if (command === "seek") {
        seekSong(client, args, message);
      }

      // Queue releated code
      manageQueue(client, message, command);

      // set volume
      if (command === "setvolume") {
        setVolume(client, message);
      }

      // check which song is currently playing
      if (command === "song") {
        getCurrentSong(client, message);
      }

      // check play time of song
      if (command === "progress") {
        createProgressBar(client, message);
      }

      // music legend help
      if (command === "help") {
        createMusicHelpMenu(client, message, args);
      }
    } catch (e) {
      handleErrors(e, message);
    }
  });
}

async function playSong(client, message, args) {
  try {
    if (client.player.isPlaying(message)) {
      let song = await client.player.addToQueue(message, args.join(" "));

      if (song) {
        // if song is present then only play
        console.log(`Added ${song.name} to the queue`);
      }
      return;
    } else {
      // if no song is playing
      let song = await client.player.play(message, args.join(" "));

      if (song) {
        console.log(`Started playing ${song.name}`);
      }
      return;
    }
  } catch (e) {
    throw e;
  }
}

function pauseSong(client, message) {
  let song = client.player.pause(message);
  if (song) message.channel.send(`${song.name} was paused!`);
}

function resumeSong(client, message) {
  let song = client.player.resume(message);
  if (song) message.channel.send(`${song.name} was resumed!`);
}

async function seekSong(client, args, message) {
  // If provided 10 seconds, it would send the Milliseconds stamp (10 * 1000)
  try {
    isSeeked = true;
    let song = await client.player.seek(message, parseInt(args[0] * 1000));
  } catch (error) {
    throw error;
  }
}

function setVolume(client, message) {
  let isDone = client.player.setVolume(message, parseInt(args[0]));
  if (isDone) message.channel.send(`Volume set to ${args[0]}%!`);
}

async function getCurrentSong(client, message) {
  let song = await client.player.nowPlaying(message);
  if (song) message.channel.send(`Current song: ${song.name}`);
}

function createProgressBar(client, message) {
  let progressBar = client.player.createProgressBar(message, {
    size: 15,
    block: "=",
    arrow: ">",
  });
  if (progressBar) message.channel.send(progressBar);
}

function createMusicHelpMenu(client, message, args) {
  if (args[0] === "music") {
    const helpReply =
      "These are following commands: \n" +
      "**!play** ***song name***: to play a song\n" +
      "**!pause**: to pause a song\n" +
      "**!resume**: to resume a paused song\n" +
      "**!clearqueue**: clear the current queue\n" +
      "**!queue**: show the current queue\n" +
      "**!skip**: skip and play *next* song in queue\n" +
      "**!seek** ***specified secs in number***: seek song to specified secs\n" +
      "**!setvolume** ***0 to 200***\n" +
      "**!progress**: check progress of song currently playing";

    message.channel.send(helpReply);
  }
}

function manageQueue(client, message, command) {
  if (command === "clearqueue") {
    let isDone = client.player.clearQueue(message);
    if (isDone) message.channel.send("Queue was cleared!");
  }

  if (command === "queue") {
    let queue = client.player.getQueue(message);
    if (queue)
      message.channel.send(
        "Queue:\n" +
          queue.songs
            .map((song, i) => {
              return `${i === 0 ? "Now Playing" : `#${i + 1}`} - ${
                song.name
              } | ${song.author}`;
            })
            .join("\n")
      );
  }

  if (command === "skip") {
    let song = client.player.skip(message);
    if (song) message.channel.send(`${song.name} was skipped!`);
  }
}

function handleErrors(e, message) {
  // check error if client is not joined in any voice channel
  if (e.context === "VoiceChannelTypeInvalid") {
    message.reply(
      "Please join any voice channel then use this command to enjoy your song!"
    );
  }
  if (e.context === "SearchIsNull") {
    message.reply("No Song Found!");
  }
  if (e.context === "NotANumber") {
    return message.channel.send(
      `Sorry! Enter a valid number in seconds\nLike: !seek 10`
    );
  }

  message.reply(
    "Oops! Something went wrong. Problem will be solved as soon as my sensei notice it. Have a good day till then 😊"
  );
  console.log(e);
}

module.exports = playMusicHandeler;
