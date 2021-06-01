const Discord = require("discord.js")
const {
  MessageEmbed
} = require("discord.js")
const config = require("../botconfig/config.json")
const emoji = require("../botconfig/emojis.json");
const ee = require("../botconfig/embed.json")
const {
  format,
  databasing,
  escapeRegex,
  autoplay,
  edit_request_message_track_info,
  isrequestchannel,
  createBar
} = require("../handlers/functions")
const playermanager = require("../handlers/playermanager");
let hasmap = new Map();
module.exports = async (client, message) => {

    client.on("messageReactionAdd", async (reaction, user) => {

        if (reaction.message.channel.partial) await reaction.message.channel.fetch();
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        if (user.bot) return;
        if (!reaction.message.guild) return;
        //get the message object out of the reaction
        const {
          message
        } = reaction;
        //get the database information
        let db = client.setups.get(message.guild.id)
        //if its not in the setup channel return
        if (message.channel != db.textchannel) return;
        //removing the reaction of the User
        reaction.users.remove(user.id).catch(e => console.log(String(e.stack).yellow));
        //get the member who makes the reaction
        const member = message.guild.members.cache.get(user.id);
        //getting the Voice Channel Data of the Message Member
        const {
          channel
        } = member.voice;
        //if not in a Voice Channel return!
        if (!channel)
          return;
        //get the lavalink erela.js player information
        const player = client.manager.players.get(message.guild.id);
        //if no player available return error | aka not playing anything
        if (!player)
          return;
        //if there is a player and the user is not in the same channel as the Bot return information message
        if (player && channel.id !== player.voiceChannel)
          return;
        //if the user is not in the channel as in the db voice channel return error
        if (channel.id !== db.voicechannel) return;
        //switch case for every single reaction emoji someone makes
        let reactionemoji = reaction.emoji.id || reaction.emoji.name;
        switch (reactionemoji) {
          case String(emoji.react.rewind):
            //get the rewind
            let rewind = player.position - 20 * 1000;
            //if the rewind is too big or too small set it to 0
            if (rewind >= player.queue.current.duration - player.position || rewind < 0) {
              rewind = 0;
            }
            //seek to the position after the rewind
            player.seek(Number(rewind));
            break;
          case String(emoji.react.forward):
            //gets the forward time
            let forward = Number(player.position) + 20 * 1000;
            //if the forward is too big set it 1 second less
            if (Number(forward) >= player.queue.current.duration) {
              forward = player.queue.current.duration - 1000;
            }
            //seek to the amount of time after the forwards
            player.seek(Number(forward));
            break;
          case String(emoji.react.pause_resume):
            //pause the player / resume it
            player.pause(player.playing);
            break;

            //////////////////////////////////////

          case String(emoji.react.stop):
            
            //leave and stop the music
            var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
            if(irc) edit_request_message_track_info(client, player, player.queue.current, "destroy");
            break;
          case String(emoji.react.previous_track):
            //if there is no previous track
            if (!player.queue.previous || player.queue.previous === null) return;
            //define the type
            let type = "skiptrack:youtube";
            //if the previous was from soundcloud, then use type soundcloud
            if (player.queue.previous.uri.includes("soundcloud")) type = "skiptrack:soundcloud"
            //plays it
            playermanager(client, message, Array(player.queue.previous.uri), type);
            break;
          case String(emoji.react.skip_track):
            //Check if there is a Dj Setup
            if (client.settings.get(message.guild.id, `djroles`).toString() !== "") {

              let channelmembersize = channel.members.size;
              let voteamount = 0;
              if (channelmembersize <= 3) voteamount = 1;
              voteamount = Math.ceil(channelmembersize / 3);

              if (!player.get(`vote-${user.id}`)) {
                player.set(`vote-${user.id}`, true);
                player.set("votes", String(Number(player.get("votes")) + 1));
                if (voteamount <= Number(player.get("votes"))) {
                  message.channel.send(new MessageEmbed()
                    .setColor(ee.color)
                    .setFooter(ee.footertext, ee.footericon)
                    .setTitle(`${emoji.msg.SUCCESS} 성공 | 투표를 하셨습니다!`)
                    .setDescription(`투표수: ${player.get("votes")} / ${voteamount}\n\n> 투표수 가 도달했습니다! 건너뛰기 ${emoji.msg.skip_track}`)
                  );
                  if (player.queue.size == 0) {
                    var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
                    if(irc) edit_request_message_track_info(client, player, player.queue.current, "destroy");
                  } else {
                    player.stop();
                  }
                } else {
                  return message.channel.send(new MessageEmbed()
                    .setColor(ee.color)
                    .setFooter(ee.footertext, ee.footericon)
                    .setTitle(`${emoji.msg.SUCCESS} 성공 | 투표를 하셨습니다!`)
                    .setDescription(`투표수: ${player.get("votes")} / ${voteamount}`)
                  );
                }
              } else {
                player.set(`vote-${user.id}`, false)
                player.set("votes", String(Number(player.get("votes")) - 1));
                return message.channel.send(new MessageEmbed()
                  .setColor(ee.color)
                  .setFooter(ee.footertext, ee.footericon)
                  .setTitle(`${emoji.msg.SUCCESS} 성공 | 투표를 취소하셨습니다!`)
                  .setDescription(`투표수: ${player.get("votes")} / ${voteamount}`)
                );
              }
            } else {
              //if ther is nothing more to skip then stop music and leave the Channel
              if (player.queue.size == 0) {
                //if its on autoplay mode, then do autoplay before leaving...
                if (player.get("autoplay")) return autoplay(client, player, "skip");
                //stop playing
                var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
                if(irc) edit_request_message_track_info(client, player, player.queue.current, "destroy");
                //send success message
                return;
              }
              //skip the track
              player.stop();
              //send success message
              return message.channel.send(new MessageEmbed()
                .setTitle(`${emoji.msg.SUCCESS} 성공 | ${emoji.msg.skip_track} 노래를 스킵되었습니다. 다음 노래를 재생합니다.`)
                .setColor(ee.color)
                .setFooter(ee.footertext, ee.footericon)
              );
            }
            break;

            //////////////////////////////////////

          case String(emoji.react.replay_track):
            //seek to 0
            player.seek(0);
            break;
          case String(emoji.react.reduce_volume):
            //get the volume
            let volumedown = player.volume - 10;
            //if its too small set it to 0
            if (volumedown < 0) volumedown = 0;
            //set the palyer volume to the volume
            player.setVolume(volumedown);
            
            if(!player.queue) return;
            if(!player.queue.current) return;
            if(player.get("message").guild) 
            player.get("message").channel.messages.fetch(client.setups.get(player.get("message").guild.id).message_track_info).then(msg=>{
                msg.edit(msg.embeds[0].setFooter(`재생목록: ${player.queue.size}  •  볼륨: ${player.volume}%  •  자동재생: ${player.get(`autoplay`) ? `✔️` : `❌`}  •  반복: ${player.queueRepeat ? `✔️ 재생목록` : player.trackRepeat ? `✔️ 노래` : `❌`}`, player.queue.current.requester.displayAvatarURL({
                  dynamic: true
                }))).catch(e => console.log("Couldn't delete msg, this is for preventing a bug".gray));
              })
            break;
          case String(emoji.react.raise_volume):
            //get the volume
            let volumeup = player.volume + 10;
            //if its too small set it to 0
            if (volumeup > 150) volumeup = 0;
            //set the palyer volume to the volume
            player.setVolume(volumeup);
            
            if(!player.queue) return;
            if(!player.queue.current) return;
            if(player.get("message").guild) 
            player.get("message").channel.messages.fetch(client.setups.get(player.get("message").guild.id).message_track_info).then(msg=>{
                msg.edit(msg.embeds[0].setFooter(`재생목록: ${player.queue.size}  •  볼륨: ${player.volume}%  •  자동재생: ${player.get(`autoplay`) ? `✔️` : `❌`}  •  반복: ${player.queueRepeat ? `✔️ 재생목록` : player.trackRepeat ? `✔️ 노래` : `❌`}`, player.queue.current.requester.displayAvatarURL({
                  dynamic: true
                }))).catch(e => console.log("Couldn't delete msg, this is for preventing a bug".gray));
              })
            break;

            //////////////////////////////////////

          case String(emoji.react.toggle_mute):
            //get the volume
            let volumemute = player.volume === 0 ? 50 : 0;
            //set the palyer volume to the volume
            player.setVolume(volumemute);
            break;
          case String(emoji.react.repeat_mode):
            //if both repeat modes are off
            if (!player.trackRepeat && !hasmap.get(message.guild.id)) {
              hasmap.set(message.guild.id, 1)
              //and queue repeat mode to off
              player.setQueueRepeat(!player.queueRepeat);
              //set track repeat mode to on
              player.setTrackRepeat(!player.trackRepeat);
            }
            //if track repeat mode is on and queue repeat mode off
            else if (player.trackRepeat && hasmap.get(message.guild.id) === 1) {
              hasmap.set(message.guild.id, 2)
              //set track repeat mode off
              player.setTrackRepeat(!player.trackRepeat);
              //set queue repeat mode on
              player.setQueueRepeat(!player.queueRepeat);
            }
            //otherwise like queue on and track should be off...
            else {
              hasmap.delete(message.guild.id)
              //set track repeat mode off
              player.setTrackRepeat(false);
              //set queue repeat mode off
              player.setQueueRepeat(false);
            }
            if(!player.queue) return;
            if(!player.queue.current) return;
            if(player.get("message").guild) 
            player.get("message").channel.messages.fetch(client.setups.get(player.get("message").guild.id).message_track_info).then(msg=>{
                msg.edit(msg.embeds[0].setFooter(`재생목록: ${player.queue.size}  •  볼륨: ${player.volume}%  •  자동재생: ${player.get(`autoplay`) ? `✔️` : `❌`}  •  반복: ${player.queueRepeat ? `✔️ 재생목록` : player.trackRepeat ? `✔️ 노래` : `❌`}`, player.queue.current.requester.displayAvatarURL({
                  dynamic: true
                }))).catch(e => console.log("Couldn't delete msg, this is for preventing a bug".gray));
              })
            break;
          case String(emoji.react.autoplay_mode):
            //toggle autoplay
            player.set("autoplay", !player.get("autoplay"))

            if(!player.queue) return;
            if(!player.queue.current) return;
            if(player.get("message").guild) 
            player.get("message").channel.messages.fetch(client.setups.get(player.get("message").guild.id).message_track_info).then(msg=>{
                msg.edit(msg.embeds[0].setFooter(`재생목록: ${player.queue.size}  •  볼륨: ${player.volume}%  •  자동재생: ${player.get(`autoplay`) ? `✔️` : `❌`}  •  반복: ${player.queueRepeat ? `✔️ 재생목록` : player.trackRepeat ? `✔️ 노래` : `❌`}`, player.queue.current.requester.displayAvatarURL({
                  dynamic: true
                }))).catch(e => console.log("Couldn't delete msg, this is for preventing a bug".gray));
              })
            break;

            //////////////////////////////////////

          case String(emoji.react.shuffle):
            //shuffle the Queue
            player.queue.shuffle();

            break;
          case String(emoji.react.show_queue):
            //define the Embed
            const embed = new MessageEmbed()
              .setAuthor(`Queue for ${message.guild.name}  -  [ ${player.queue.length} Tracks ]`, message.guild.iconURL({
                dynamic: true
              }))
              .setColor(ee.color);
            //if there is something playing rn, then add it to the embed
            if (player.queue.current) embed.addField("**0) 재생중인 음악**", `[${player.queue.current.title.substr(0, 35)}](${player.queue.current.uri}) - ${player.queue.current.isStream ? "LIVE STREAM" : format(player.queue.current.duration).split(" | ")[0]} - 요청인: **${player.queue.current.requester.tag}**`);
            //get the right tracks of the current tracks
            const tracks = player.queue;
            //if there are no other tracks, information
            if (!tracks.length){
              user.send(embed.setDescription(`${emoji.msg.ERROR} 재생목록에 노래가 없습니다.`))
              message.channel.send(new MessageEmbed()
                .setTitle(`${emoji.msg.SUCCESS} 재생목록를 보려면 메시지 확인해주세요!`)
                .setColor(ee.color)
                .setFooter(ee.footertext, ee.footericon)
              );
              return;
            }
            //if not too big send queue in channel
            if (tracks.length < 15){
              user.send(embed.setDescription(tracks.map((track, i) => `**${++i})** [${track.title.substr(0, 35)}](${track.uri}) - ${track.isStream ? "LIVE STREAM" : format(track.duration).split(" | ")[0]} - **요청인: ${track.requester.tag}**`).join("\n")))
              message.channel.send(new MessageEmbed()
                .setTitle(`${emoji.msg.SUCCESS} 재생목록를 보려면 메시지 확인해주세요!`)
                .setColor(ee.color)
                .setFooter(ee.footertext, ee.footericon)
              );
              return;
            }
            //get an array of quelist where 15 tracks is one index in the array
            let quelist = [];
            for (let i = 0; i < tracks.length; i += 15) {
              let songs = tracks.slice(i, i + 15);
              quelist.push(songs.map((track, index) => `**${i + ++index})** [${track.title.split("[").join("{").split("]").join("}").substr(0, 35)}](${track.uri}) - ${track.isStream ? "LIVE STREAM" : format(track.duration).split(" | ")[0]} - **요청인: ${track.requester.tag}**`).join("\n"))
            }
            let limit = quelist.length <= 5 ? quelist.length : 5
            for (let i = 0; i < limit; i++) {
              await user.send(embed.setDescription(String(quelist[i]).substr(0, 2048)));
            }
            user.send(new MessageEmbed()
              .setDescription(`${emoji.msg.SUCCESS} | <#${message.channel.id}>${quelist.length <= 5 ? "" : "\n참고: -"}`)
              .setColor(ee.color)
              .setFooter(ee.footertext, ee.footericon)
            )
            message.channel.send(new MessageEmbed()
              .setTitle(`${emoji.msg.SUCCESS} 재생목록를 보려면 메시지 확인해주세요!`)
              .setColor(ee.color)
              .setFooter(ee.footertext, ee.footericon)
            );

            break;
          case String(emoji.react.show_current_track):
            //Send Now playing Message
            user.send(new MessageEmbed()
              .setAuthor("현재 재생 중인 노래:", user.displayAvatarURL({
                dynamic: true
              }))
              .setThumbnail(player.queue.current.displayThumbnail(1))
              .setURL(player.queue.current.uri)
              .setColor(ee.color)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle(`${player.playing ? emoji.msg.resume : emoji.msg.pause} **${player.queue.current.title}**`)
              .addField(`${emoji.msg.time} 길이: `, "`" + format(player.queue.current.duration) + "`", true)
              .addField(`${emoji.msg.song_by} 출처: `, "`" + player.queue.current.author + "`", true)
              .addField(`${emoji.msg.repeat_mode} 재생목록 갯수: `, `${player.queue.length} Songs`, true)
              .addField(`${emoji.msg.time} 진행률: `, createBar(player))
              .setFooter(`요청인: ${player.queue.current.requester.tag}`, player.queue.current.requester.displayAvatarURL({
                dynamic: true
              }))
            )
            message.channel.send(new MessageEmbed()
              .setTitle(`${emoji.msg.SUCCESS} 재생목록를 보려면 메시지 확인해주세요!`)
              .setColor(ee.color)
              .setFooter(ee.footertext, ee.footericon)
            );
            break;
        }
    })

}