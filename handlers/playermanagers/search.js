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

//function for searching songs
async function search(client, message, args, type) {
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
      res = await client.manager.search({
        query: search,
        source: type.split(":")[1]
      }, message.author);
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


    var max = 10,
      collected, filter = (m) => m.author.id === message.author.id && /^(\d+|end)$/i.test(m.content);
    if (res.tracks.length < max) max = res.tracks.length;
    track = res.tracks[0]

    var results = res.tracks
      .slice(0, max)
      .map((track, index) => `**${++index})** [\`${String(track.title).substr(0, 60).split("[").join("{").split("]").join("}")}\`](${track.uri}) - \`${format(track.duration).split(" | ")[0]}\``)
      .join('\n');

    message.channel.send(new MessageEmbed()
      .setTitle(`검색중... | 🔎 **\`${search}`.substr(0, 256 - 3) + "`**")
      .setColor(ee.color).setFooter(ee.footertext, ee.footericon)
      .setDescription(results)
      .setFooter(`검색 요청인: ${track.requester.tag}`, track.requester.displayAvatarURL({
        dynamic: true
      }))
    )

    await message.channel.send(new MessageEmbed()
      .setColor(ee.color)
      .setFooter(ee.footertext, ee.footericon)
      .setTitle("'Index 번호'로 노래 선택")
    )
    try {
      collected = await message.channel.awaitMessages(filter, {
        max: 1,
        time: 30e3,
        errors: ['time']
      });
    } catch (e) {
      if (!player.queue.current) player.destroy();
      return message.channel.send(new MessageEmbed()
        .setTitle("❌ 오류 | 선택 항목을 입력하지 않았습니다.")
        .setColor(ee.wrongcolor)
        .setFooter(ee.footertext, ee.footericon)
      );
    }
    var first = collected.first().content;
    if (first.toLowerCase() === 'end') {
      if (!player.queue.current) player.destroy();
      return message.channel.send(new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle('❌ 오류 | 선택이 취소되었습니다.')
      );
    }
    var index = Number(first) - 1;
    if (index < 0 || index > max - 1)
      return message.channel.send(new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(`❌ 오류 | 입력한 숫자가 너무 작거나 너무 큽니다 (1-${max}).`)
      );
    track = res.tracks[index];
    if (!res.tracks[0])
      return message.channel.send(new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(String("❌ 오류 | 다음 항목을 찾을 수 없습니다. **`" + search).substr(0, 256 - 3) + "`**")
        .setDescription(`다시 시도해주세요!`)
      );
    if (player.state !== "CONNECTED") {
      //set the variables
      player.set("message", message);
      player.set("playerauthor", message.author.id);
      player.connect();
      //add track
      player.queue.add(track);
      //set the variables
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
      player.queue.add(track);
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
      player.queue.add(track);
      //if its inside a request channel edit the msg
      var irc = await isrequestchannel(client, player.textChannel, player.guild);
      if (irc) {
        edit_request_message_queue_info(client, player);
      }
      var embed3 = new MessageEmbed()
        .setTitle(`재생목록 추가 | 🩸 **\`${track.title}`.substr(0, 256 - 3) + "`**")
        .setURL(track.uri)
        .setColor(ee.color)
        .setThumbnail(track.displayThumbnail(1))
        .addField("⌛ 시간: ", `\`${track.isStream ? "LIVE STREAM" : format(track.duration)}\``, true)
        .addField("💯 출처: ", `\`${track.author}\``, true)
        .addField("🔂 재생목록 갯수: ", `\`${player.queue.length} 개\``, true)
        .setFooter(`요청인: ${track.requester.tag}`, track.requester.displayAvatarURL({
          dynamic: true
        }))
      return message.channel.send(embed3).then(msg => {
          if(msg) msg.delete({
            timeout: 4000
          }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
      });
    }

  } catch (e) {
    console.log(String(e.stack).red)
    message.channel.send(new MessageEmbed()
      .setColor(ee.wrongcolor)
      .setFooter(ee.footertext, ee.footericon)
      .setTitle(String("❌ 오류 | 다음 항목을 찾을 수 없습니다. **`" + search).substr(0, 256 - 3) + "`**")
    )
  }
}

module.exports = search;

