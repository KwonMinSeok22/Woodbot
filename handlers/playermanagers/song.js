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

//function for playling song
async function song(client, message, args, type) {
  var search = args.join(" ");

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
      if (type.split(":")[1] === "youtube" || type.split(":")[1] === "soundcloud")
        res = await client.manager.search({
          query: search,
          source: type.split(":")[1]
        }, message.author);
      else {
        res = await client.manager.search(search, message.author);
      }
      // Check the load type as this command is not that advanced for basics
      if (res.loadType === "LOAD_FAILED") throw res.exception;
      else if (res.loadType === "PLAYLIST_LOADED") throw {
        message: "플레이리스트는 이 명령에서 지원되지 않습니다. +플레이리스트"
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
        .setDescription(`다시 시도해주세요!`)
      );
    //if the player is not connected, then connect and create things
    if (player.state !== "CONNECTED") {
      //set the variables
      player.set("message", message);
      player.set("playerauthor", message.author.id);
      //connect
      player.connect();
      //add track
      player.queue.add(res.tracks[0]);
      //play track
      player.play();
      player.pause(false);
      
      var irc = await isrequestchannel(client, player.textChannel, player.guild);
      if (irc) {
        edit_request_message_track_info(client, player, player.queue.current);
        edit_request_message_queue_info(client, player);
      }
    }
    else if(!player.queue || !player.queue.current){
      //add track
      player.queue.add(res.tracks[0]);
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
      //add the latest track
      player.queue.add(res.tracks[0]);
      //if its in a request channel edit queu info
      var irc = await isrequestchannel(client, player.textChannel, player.guild);
      if (irc) {
        edit_request_message_queue_info(client, player);
      }
      //send track information
      var playembed = new MessageEmbed()
        .setTitle(`재생목록 추가 | 🩸 **\`${res.tracks[0].title}`.substr(0, 256 - 3) + "`**")
        .setURL(res.tracks[0].uri).setColor(ee.color).setFooter(ee.footertext, ee.footericon)
        .setThumbnail(`https://img.youtube.com/vi/${res.tracks[0].identifier}/mqdefault.jpg`)
        .addField("⌛ 길이: ", `\`${res.tracks[0].isStream ? "LIVE STREAM" : format(res.tracks[0].duration)}\``, true)
        .addField("💯 출처: ", `\`${res.tracks[0].author}\``, true)
        .addField("🔂 재생목록 갯수: ", `\`${player.queue.length} 개\``, true)
        .setFooter(`요청인: ${res.tracks[0].requester.tag}`, res.tracks[0].requester.displayAvatarURL({
          dynamic: true
        }))
      return message.channel.send(playembed).then(msg => {
        if (msg) msg.delete({
          timeout: 4000
        }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
      });
    }


}

module.exports = song;
