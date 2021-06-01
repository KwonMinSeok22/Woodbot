var {
  MessageEmbed
} = require("discord.js")
var ee = require("../../botconfig/embed.json")
var config = require("../../botconfig/config.json")
var {
  format,
  isrequestchannel,
  delay,
  edit_request_message_queue_info,
  edit_request_message_track_info,
  arrayMove
} = require("../functions")

//function for playing playlists
async function playlist(client, message, args, type) {
  var search = args.join(" ");
  try {
    var res;
    var player = client.manager.players.get(message.guild.id);
    if(!player)
      player = client.manager.create({
        guild: message.guild.id,
        voiceChannel: message.member.voice.channel.id,
        textChannel: message.channel.id,
        selfDeafen: config.settings.selfDeaf,
      });
    let state = player.state;
    if (state !== "CONNECTED") { 
      //set the variables
      player.set("message", message);
      player.set("playerauthor", message.author.id);
      player.connect();
      player.stop();
    }
    try {
      // Search for tracks using a query or url, using a query searches youtube automatically and the track requester object
      res = await client.manager.search(search, message.author);
      // Check the load type as this command is not that advanced for basics
      if (res.loadType === "LOAD_FAILED") throw res.exception;
      else if (res.loadType === "SEARCH_RESULT") throw {
        message: "이 명령에서는 검색이 지원되지 않습니다. | +재생 또는 +검색"
      };
    } catch (e) {
      console.log(String(e.stack).red)
      return message.channel.send(new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(`❌ 오류 | 다음을 검색하는 동안 오류가 발생했습니다.`)
        .setDescription(`\`\`\`${e.message}\`\`\``)
      );
    }
    if (!res.tracks[0])
      return message.channel.send(new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(String("❌ 오류 | 다음 항목을 찾을 수 없습니다. **`" + search).substr(0, 256 - 3) + "`**")
        .setDescription(`Please retry!`)
      );
    //if the player is not connected, then connect and create things
    if (player.state !== "CONNECTED") {
      //set the variables
      player.set("message", message);
      player.set("playerauthor", message.author.id);
      player.connect();
      //add track
      player.queue.add(res.tracks);
      //play track
      player.play();
      player.pause(false);
      //if its inside a request channel edit the msg
      var irc = await isrequestchannel(client, player.textChannel, player.guild);
      if (irc) {
        edit_request_message_track_info(client, player, player.queue.current);
        edit_request_message_queue_info(client, player);
      }
    }
    else if(!player.queue || !player.queue.current){
      //add track
      player.queue.add(res.tracks);
      //play track
      player.play();
      player.pause(false);
      //if its inside a request channel edit the msg
      var irc = await isrequestchannel(client, player.textChannel, player.guild);
      if (irc) {
        edit_request_message_track_info(client, player, player.queue.current);
        edit_request_message_queue_info(client, player);
      }
    }
    else {
      //add the tracks
      player.queue.add(res.tracks);
      //if its inside a request channel edit the msg
      var irc = await isrequestchannel(client, player.textChannel, player.guild);
      if (irc) {
        edit_request_message_queue_info(client, player);
      }
    }
    //send information
    var playlistembed = new MessageEmbed()
        .setTitle(`플레이리스트 추가 | 🩸 **\`${res.playlist.name}`.substr(0, 256 - 3) + "`**")
        .setURL(res.playlist.uri).setColor(ee.color).setFooter(ee.footertext, ee.footericon)
        .setThumbnail(`https://img.youtube.com/vi/${res.tracks[0].identifier}/mqdefault.jpg`)
        .addField("⌛ 길이: ", `\`${format(res.playlist.duration)}\``, true)
        .addField("🔂 재생목록 갯수: ", `\`${player.queue.length} 노래\``, true)
        .setFooter(`요청인: ${message.author.tag}`, message.author.displayAvatarURL({
          dynamic: true
        }))
      message.channel.send(playlistembed).then(msg => {
        if (msg) msg.delete({
          timeout: 4000
        }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
      });

  } catch (e) {
    console.log(String(e.stack).red)
    message.channel.send(new MessageEmbed()
      .setColor(ee.wrongcolor)
      .setFooter(ee.footertext, ee.footericon)
      .setTitle(String("❌ 오류 | 다음 항목을 찾을 수 없습니다. **`" + search).substr(0, 256 - 3) + "`**")
    )
  }
}

module.exports = playlist;
