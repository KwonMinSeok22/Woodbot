var {
      MessageEmbed
    } = require("discord.js"),
    ms = require("ms"),

    config = require("../../botconfig/config.json"),
    emoji = require("../../botconfig/emojis.json"),
    ee = require("../../botconfig/embed.json"),
  
    {
      createBar,
      format,
      databasing,
      isrequestchannel,
      edit_request_message_track_info,
      autoplay
    } = require("../../handlers/functions"),
    playermanager = require("../../handlers/playermanager"),
  
    hasmap = new Map();
    var mi;
  module.exports = (client) => {
      client.manager
        .on("playerCreate", async (player) => {
            player.setVolume(50);
            player.set("autoplay", false);
            player.set(`afk-${player.guild}`, false)
            player.set(`afk-${player.get("playerauthor")}`, false)
            player.setEQ(client.eqs.music);
            databasing(client, player.guild, player.get("playerauthor"));
  
            var embed = new MessageEmbed();
              embed.setTitle(`:thumbsup: **참가함** \`${client.channels.cache.get(player.voiceChannel).name}\``)
              embed.setDescription(`**바인딩된 명령어: ** <#${client.channels.cache.get(player.textChannel).id}>`)
            
              var irc = await isrequestchannel(client, player.textChannel, player.guild);
              if(!irc) client.channels.cache.get(player.textChannel).send(embed.setColor(ee.color)).catch(e=>console.log("this prevents a crash"));
              if(config.settings.serverDeaf)
              for(var i = 0; i<= 5; i++){
                await new Promise((res)=>{
                  setTimeout(()=>{
                    res(2)
                    var guild = client.guilds.cache.get(player.guild)
                    guild.me.voice.setDeaf(true).catch(e=>console.log("ignore that log".gray));
                    i = 10;
                  }, 1000)
                })
              }
              
        })
        .on("playerMove", async (player, oldChannel, newChannel) => {
          if (!newChannel) {
              var embed = new MessageEmbed().setColor(ee.wrongcolor).setFooter(ee.footertext, ee.footericon);
              embed.setTitle(`${emoji.msg.ERROR} 재생목록 종료`)
              embed.setDescription(`채널을 나갔습니다. \`🔈 ${client.channels.cache.get(player.voiceChannel).name}\``)
              var irc = await isrequestchannel(client, player.textChannel, player.guild);
              if(irc) edit_request_message_track_info(client, player);
            client.channels.cache.get(player.textChannel).send(embed);
            try {
              client.channels.cache.get(player.textChannel).messages.fetch(player.get("playermessage")).then(msg => {
                if(msg && msg.deletable)
                  msg.delete({
                    timeout: 1500
                  }).catch(e => console.log("Couldn't delete message this is a catch to prevent a crash".grey));
              });
            } catch (e) {
              console.log(String(e.stack).yellow);
            }
            var irc2 = await isrequestchannel(client, player.textChannel, player.guild);
            if(irc2) return edit_request_message_track_info(client, player, player.queue.current, "destroy");
            player.destroy();
          } else {
            player.voiceChannel = newChannel;
            if (player.paused) return;
            setTimeout(() => {
              player.pause(true);
              setTimeout(() => player.pause(false), client.ws.ping * 2);
            }, client.ws.ping * 2);
          }
        })
        .on("trackStart", async (player, track) => {
          try {
            //votes for skip --> 0
            player.set("votes", "0");
            //set the vote of every user to FALSE so if they voteskip it will vote skip and not remove voteskip if they have voted before bruh
            for (var userid of client.guilds.cache.get(player.guild).members.cache.map(member => member.user.id))
              player.set(`vote-${userid}`, false);
            //set the previous track just have idk where its used ^-^
            player.set("previoustrack", track);
            //increasing the stats of the BOT
            client.stats.inc(player.guild, "songs");
            client.stats.inc("global", "songs");
            //wait 500 ms
            await new Promise((resolve) => {
              setTimeout(() => {
                resolve(2);
              }, 500);
            });
            // playANewTrack(client,player,track);
            var embed = new MessageEmbed().setColor(ee.color)
              embed.setTitle(`**${emoji.msg.playing} | ${track.title}**`)
              embed.setURL(track.uri)
              embed.setThumbnail(`https://img.youtube.com/vi/${track.identifier}/mqdefault.jpg`)
              embed.addField(`**${emoji.msg.time} 길이: **`, `\`❯ ${track.isStream ? `LIVE STREAM` : format(track.duration)}\``, true)
              embed.addField(`**${emoji.msg.song_by} 출처:**`, `\`❯ ${track.author}\``, true)
              embed.addField(`**${emoji.msg.repeat_mode} 재생목록 갯수:**`, `\`❯ ${player.queue.length} 개\``, true)
              embed.setFooter(`Requested by: ${track.requester.tag}`, track.requester.displayAvatarURL({dynamic: true}));
            var irc = await isrequestchannel(client, player.textChannel, player.guild);
            if(irc) {
              //try to clear the interval
              try{
                clearInterval(mi);
              }catch{ }
              //LOOP EDIT THE MSG
              mi = setInterval(()=>{
                if (!client.manager.players.get(player.guild)) 
                  return clearInterval(mi);
                if(!player.queue) return clearInterval(mi);
                if(!player.queue.current) return clearInterval(mi);
                var message = player.get("message");
                if(player && !message.guild) client.channels.fetch(player.textChannel).then(ch=>{
                  message = ch.lastMessage;
                })
                if(message && message.guild) {
                  message.channel.messages.fetch(client.setups.get(message.guild.id).message_track_info).then(msg=>{
                    msg.edit(msg.embeds[0].setDescription(`${createBarlul(player)}`)).catch(e => console.log("Couldn't delete msg, this is for preventing a bug".gray));
                  })
                  function createBarlul(player) {
                    try{
                      //player.queue.current.duration == 0 ? player.position : player.queue.current.duration, player.position, 25, "▬", config.settings.progressbar_emoji)
                      if (!player.queue.current) return `**[${config.settings.progressbar_emoji}${line.repeat(size - 1)}]**\n**00:00:00 / 00:00:00**`;
                      let current = player.queue.current.duration !== 0 ? player.position : player.queue.current.duration;
                      let total = player.queue.current.duration;
                      let size = 25;
                      let line = "▬";
                      let slider = config.settings.progressbar_emoji;
                      let bar = current > total ? [line.repeat(size / 2 * 2), (current / total) * 100] : [line.repeat(Math.round(size / 2 * (current / total))).replace(/.$/, slider) + line.repeat(size - Math.round(size * (current / total)) + 1), current / total];
                      if (!String(bar[0]).includes(config.settings.progressbar_emoji)) return `**[${config.settings.progressbar_emoji}${line.repeat(size - 1)}]**\n**00:00:00 / 00:00:00**`;
                      return `**[${bar[0]}]**\n**${new Date(player.position).toISOString().substr(11, 8)+" / "+(player.queue.current.duration==0?" ◉ LIVE":new Date(player.queue.current.duration).toISOString().substr(11, 8))}**`;
                    }catch (e){
                      console.log(String(e.stack).bgRed)
                    }
                  }
                } 
              }, 10000)
  
              return edit_request_message_track_info(client, player, player.queue.current);
            }
            //if pruning is enabled --> send the msg
            if (client.settings.get(player.guild, `pruning`))
              client.channels.cache.get(player.textChannel).send(embed).then(msg => {
                //try to delete the old playingsongmsg informational track if not available / get able --> catch and dont crash
                try {
                  if (player.get(`playingsongmsg`) && msg.id !== player.get(`playingsongmsg`).id)
                    player.get(`playingsongmsg`).delete().catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                } catch {
                  /* */ }
                //set the old message information to a variable
                player.set(`playingsongmsg`, msg)
                //react with all emojis
                var failed = false;
                  msg.react(emoji.react.rewind).catch(e => failed = true); //rewind 20 seconds
                  msg.react(emoji.react.forward).catch(e => failed = true); //forward 20 seconds
                  msg.react(emoji.react.pause_resume).catch(e => failed = true); //pause / resume
                  msg.react(emoji.react.stop).catch(e => failed = true); //stop playing music
                  msg.react(emoji.react.previous_track).catch(e => failed = true); //skip back  track / (play previous)
                  msg.react(emoji.react.skip_track).catch(e => failed = true); //skip track / stop playing
                  msg.react(emoji.react.replay_track).catch(e => failed = true); //replay track
                  msg.react(emoji.react.reduce_volume).catch(e => failed = true); //reduce volume by 10%
                  msg.react(emoji.react.raise_volume).catch(e => failed = true); //raise volume by 10%
                  msg.react(emoji.react.toggle_mute).catch(e => failed = true); //toggle mute
                  msg.react(emoji.react.repeat_mode).catch(e => failed = true); //change repeat mode --> track --> Queue --> none
                  msg.react(emoji.react.autoplay_mode).catch(e => failed = true); //toggle autoplay mode
                  msg.react(emoji.react.shuffle).catch(e => failed = true); //shuffle the Queue
                  msg.react(emoji.react.show_queue).catch(e => failed = true); //shows the Queue
                  msg.react(emoji.react.show_current_track).catch(e => failed = true); //shows the current Track
               
                if (failed)
                  msg.channel.send(new MessageEmbed()
                    .setColor(ee.wrongcolor)
                    .setFooter(ee.footertext, ee.footericon)
                    .setTitle(`${emojis.msg.ERROR} 오류 | 반응을 추가할 수 없습니다.`)
                    .setDescription(`리액션을 추가할 수 있는 권한이 있는지 확인해주세요!`)
                  )
                //create the collector
                var collector = msg.createReactionCollector((reaction, user) => user.id !== client.user.id, {
                  time: track.duration > 0 ? track.duration : 600000
                });
  
                collector.on(`collect`, async (reaction, user) => {
                  try {
                    if (user.bot) return;
                    //get the message object out of the reaction
                    var {
                      message
                    } = reaction;
                    //get the database information
                    var db = client.setups.get(message.guild.id)
                    //removing the reaction of the User
                    try {
                      reaction.users.remove(user.id).catch(e => console.log(String(e.stack).yellow));
                    } catch {
                      /* */ }
                    //get the member who makes the reaction
                    var member = message.guild.members.cache.get(user.id);
                    //getting the Voice Channel Data of the Message Member
                    var {
                      channel
                    } = member.voice;
                    //if not in a Voice Channel return!
                    if (!channel) return message.channel.send(new MessageEmbed().setColor(ee.wrongcolor).setFooter(ee.footertext, ee.footericon).setTitle(`${emoji.msg.ERROR} 오류 | 음성 채널에 참가해야 합니다.`));
                    //get the lavalink erela.js player information
                    var player = client.manager.players.get(message.guild.id);
                    //if there is a player and the user is not in the same channel as the Bot return information message
                    if (player && channel.id !== player.voiceChannel) return message.channel.send(new MessageEmbed().setColor(ee.wrongcolor).setFooter(ee.footertext, ee.footericon).setTitle(`${emoji.msg.ERROR} 오류 | 이미 다른 곳에서 재생중 입니다!`).setDescription(`재생중인 채널: ${message.guild.channels.cache.get(player.VoiceChannel).name}`));
                    //switch case for every single reaction emoji someone
                    var reactionemoji = reaction.emoji.id || reaction.emoji.name;
                    switch (reactionemoji) {
                      case String(emoji.react.rewind):
                        //get the rewind
                        var rewind = player.position - 20 * 1000;
                        //if the rewind is too big or too small set it to 0
                        if (rewind >= player.queue.current.duration - player.position || rewind < 0) {
                          rewind = 0;
                        }
                        //seek to the position after the rewind
                        player.seek(Number(rewind));
                        //send an information message
                        message.channel.send(new MessageEmbed()
                          .setTitle(`${emoji.msg.rewind} 20초 동안 노래를 되감아 다음 작업을 수행합니다. ${format(Number(player.position))}`)
                          .setColor(ee.color)
                          .setFooter(ee.footertext, ee.footericon)
                        ).then(msg => {
                          if(msg && msg.deletable)
                            msg.delete({
                              timeout: 4000
                            }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                        });
                        break;
                      case String(emoji.react.forward):
                        //gets the forward time
                        var forward = Number(player.position) + 20 * 1000;
                        //if the forward is too big set it 1 second less
                        if (Number(forward) >= player.queue.current.duration) {
                          forward = player.queue.current.duration - 1000;
                        }
                        //seek to the amount of time after the forwards
                        player.seek(Number(forward));
                        //send an information message
                        message.channel.send(new MessageEmbed()
                          .setTitle(`${emoji.msg.forward} 음악을 다음 20초 동안 전달: ${format(Number(player.position))}`)
                          .setColor(ee.color)
                          .setFooter(ee.footertext, ee.footericon)
                        ).then(msg => {
                          if(msg && msg.deletable)
                            msg.delete({
                              timeout: 4000
                            }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                        });
                        break;
                      case String(emoji.react.pause_resume):
                        //pause the player / resume it
                        player.pause(player.playing);
                        //send information message
                        message.channel.send(new MessageEmbed()
                          .setTitle(`${player.playing ? `${emoji.msg.resume} 재개됨` : `${emoji.msg.pause} 일시중지`}`)
                          .setColor(ee.color)
                          .setFooter(ee.footertext, ee.footericon)
                        ).then(msg => {
                          if(msg && msg.deletable) msg.delete({
                              timeout: 4000
                            }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                        });
                        break;
  
                        //////////////////////////////////////
  
                      case String(emoji.react.stop):
                        var irc = await isrequestchannel(client, player.textChannel, player.guild);
                        if(irc) return edit_request_message_track_info(client, player, player.queue.current, "destroy");
                        //leave and stop the music
                        player.destroy();
                        //send information message
                        message.channel.send(new MessageEmbed()
                          .setTitle(`${emoji.msg.stop} 채널을 중지하고 종료했습니다.`)
                          .setColor(ee.color)
                          .setFooter(ee.footertext, ee.footericon)
                        ).then(msg => {
                          if(msg && msg.deletable) msg.delete({
                              timeout: 4000
                            }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                        });
                        break;
                      case String(emoji.react.previous_track):
                        //if there is no previous track
                        if (!player.queue.previous || player.queue.previous === null)
                          return message.channel.send(new MessageEmbed()
                            .setColor(ee.wrongcolor)
                            .setFooter(ee.footertext, ee.footericon)
                            .setTitle(`${emoji.msg.ERROR} 오류 | 아직 이전 노래가 없습니다!`)
                          ).then(msg => {
                            if(msg && msg.deletable) msg.delete({
                                timeout: 4000
                              }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                          });
                        message.channel.send(new MessageEmbed()
                          .setTitle(`${emoji.msg.previous_track} 이전 트랙 재생`)
                          .setColor(ee.color)
                          .setFooter(ee.footertext, ee.footericon)
                        ).then(msg => {
                          if(msg && msg.deletable) msg.delete({
                              timeout: 4000
                            }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                        });
                        //define the type
                        var type = "skiptrack:youtube";
                        //if the previous was from soundcloud, then use type soundcloud
                        if (player.queue.previous.uri.includes("soundcloud")) type = "skiptrack:soundcloud"
                        //plays it
                        playermanager(client, message, Array(player.queue.previous.uri), type);
                        break;
                      case String(emoji.react.skip_track):
                        //Check if there is a Dj Setup
                        if (client.settings.get(message.guild.id, `djroles`).toString() !== "") {
  
                          var channelmembersize = channel.members.size;
                          var voteamount = 0;
                          if (channelmembersize <= 3) voteamount = 1;
                          voteamount = Math.ceil(channelmembersize / 3);
  
                          if (!player.get(`vote-${user.id}`)) {
                            player.set(`vote-${user.id}`, true);
                            player.set("votes", String(Number(player.get("votes")) + 1));
                            if (voteamount <= Number(player.get("votes"))) {
                              message.channel.send(new MessageEmbed()
                                .setColor(ee.color)
                                .setFooter(ee.footertext, ee.footericon)
                                .setTitle(`${emoji.msg.SUCCESS} 성공 | 투표가 추가되었습니다.`)
                                .setDescription(`There are now: ${player.get("votes")} of ${voteamount} needed Votes\n\n> Amount reached! Skipping ${emoji.msg.skip_track}`)
                              );
                              if (player.queue.size == 0) {
                                var irc3 = await isrequestchannel(client, player.textChannel, player.guild);
                                if(irc3) return edit_request_message_track_info(client, player, player.queue.current, "destroy");
                                player.destroy();
                              } else {
                                player.stop();
                              }
                            } else {
                              return message.channel.send(new MessageEmbed()
                                .setColor(ee.color)
                                .setFooter(ee.footertext, ee.footericon)
                                .setTitle(`${emoji.msg.SUCCESS} Success | Added your Vote!`)
                                .setDescription(`There are now: ${player.get("votes")} of ${voteamount} needed Votes`)
                              );
                            }
                          } else {
                            player.set(`vote-${user.id}`, false)
                            player.set("votes", String(Number(player.get("votes")) - 1));
                            return message.channel.send(new MessageEmbed()
                              .setColor(ee.color)
                              .setFooter(ee.footertext, ee.footericon)
                              .setTitle(`${emoji.msg.SUCCESS} Success | Removed your Vote!`)
                              .setDescription(`There are now: ${player.get("votes")} of ${voteamount} needed Votes`)
                            );
                          }
                        } else {
                          //if ther is nothing more to skip then stop music and leave the Channel
                          if (player.queue.size == 0) {
                            //if its on autoplay mode, then do autoplay before leaving...
                            if (player.get("autoplay")) return autoplay(client, player, "skip");
                            var irc4 = await isrequestchannel(client, player.textChannel, player.guild);
                            if(irc4) return edit_request_message_track_info(client, player, player.queue.current, "destroy");
                            //stop playing
                            player.destroy();
                            //send success message
                            return message.channel.send(new MessageEmbed()
                              .setTitle(`${emoji.msg.SUCCESS} 성공 | ${emoji.msg.stop} 채널을 중지하고 종료했습니다.`)
                              .setColor(ee.color)
                              .setFooter(ee.footertext, ee.footericon)
                            );
                          }
                          //skip the track
                          player.stop();
                          //send success message
                          return message.channel.send(new MessageEmbed()
                            .setTitle(`${emoji.msg.SUCCESS} 성공 | ${emoji.msg.skip_track} 다음 곡으로 건너뜁니다.`)
                            .setColor(ee.color)
                            .setFooter(ee.footertext, ee.footericon)
                          );
                        }
                        break;
  
                        //////////////////////////////////////
  
                      case String(emoji.react.replay_track):
                        //seek to 0
                        player.seek(0);
                        //send an information message
                        message.channel.send(new MessageEmbed()
                          .setTitle(`${emoji.msg.replay_track} 현재 트랙 재생`)
                          .setColor(ee.color)
                          .setFooter(ee.footertext, ee.footericon)
                        ).then(msg => {
                          if(msg && msg.deletable) msg.delete({
                              timeout: 4000
                            }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                        });
                        break;
                      case String(emoji.react.reduce_volume):
                        //get the volume
                        var volumedown = player.volume - 10;
                        //if its too small set it to 0
                        if (volumedown < 0) volumedown = 0;
                        //set the palyer volume to the volume
                        player.setVolume(volumedown);
                        //send an informational message
                        message.channel.send(new MessageEmbed()
                          .setTitle(`${emoji.msg.reduce_volume} 볼륨 설정: **${player.volume} %**`)
                          .setColor(ee.color)
                          .setFooter(ee.footertext, ee.footericon)
                        ).then(msg => {
                          if(msg && msg.deletable) msg.delete({
                              timeout: 4000
                            }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                        });
                        break;
                      case String(emoji.react.raise_volume):
                        //get the volume
                        var volumeup = player.volume + 10;
                        //if its too small set it to 0
                        if (volumeup > 150) volumeup = 0;
                        //set the palyer volume to the volume
                        player.setVolume(volumeup);
                        //send an informational message
                        message.channel.send(new MessageEmbed()
                          .setTitle(`${emoji.msg.raise_volume}볼륨 설정: **${player.volume} %**`)
                          .setColor(ee.color)
                          .setFooter(ee.footertext, ee.footericon)
                        ).then(msg => {
                          if(msg && msg.deletable) msg.delete({
                              timeout: 4000
                            }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                        });
                        break;
  
                        //////////////////////////////////////
  
                      case String(emoji.react.toggle_mute):
                        //get the volume
                        var volumemute = player.volume === 0 ? 50 : 0;
                        //set the palyer volume to the volume
                        player.setVolume(volumemute);
                        //send an informational message
                        message.channel.send(new MessageEmbed()
                          .setTitle(`${player.volume === 0 ? `${emoji.msg.toggle_mute} 음소거 플레이어` : `${emoji.msg.reduce_volume} 음소거되지 않은 플레이어`}`)
                          .setColor(ee.color)
                          .setFooter(ee.footertext, ee.footericon)
                        ).then(msg => {
                          if(msg && msg.deletable) msg.delete({
                              timeout: 4000
                            }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                        });
                        break;
                      case String(emoji.react.repeat_mode):
                        //if both repeat modes are off
                        if (!player.trackRepeat && !hasmap.get(message.guild.id)) {
                          hasmap.set(message.guild.id, 1)
                          //and queue repeat mode to off
                          player.setQueueRepeat(!player.queueRepeat);
                          //set track repeat mode to on
                          player.setTrackRepeat(!player.trackRepeat);
                          //Send an informational message
                          message.channel.send(new MessageEmbed()
                            .setTitle(`${emoji.msg.repeat_mode} 트랙 반복 | ${player.trackRepeat ? `${emoji.msg.enabled} 활성화` : `${emoji.msg.disabled} 비활성화`}.`)
                            .setDescription(`다음 - 재생목록 반복 ${player.queueRepeat ? `${emoji.msg.enabled} 활성화` : `${emoji.msg.disabled} 비활성화`}.`)
                            .setColor(ee.color)
                            .setFooter(ee.footertext, ee.footericon)
                          ).then(msg => {
                            if(msg && msg.deletable)
                              msg.delete({
                                timeout: 4000
                              }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                          });
                        }
                        //if track repeat mode is on and queue repeat mode off
                        else if (player.trackRepeat && hasmap.get(message.guild.id) === 1) {
                          hasmap.set(message.guild.id, 2)
                          //set track repeat mode off
                          player.setTrackRepeat(!player.trackRepeat);
                          //set queue repeat mode on
                          player.setQueueRepeat(!player.queueRepeat);
                          //send informational message
                          message.channel.send(new MessageEmbed()
                            .setTitle(`${emoji.msg.repeat_mode} 재생목록 반복 | ${player.queueRepeat ? `${emoji.msg.enabled} 활성화` : `${emoji.msg.disabled} 비활성화`}.`)
                            .setDescription(`다음 - 트랙 반복 ${player.trackRepeat ? `${emoji.msg.enabled} 활성화` : `${emoji.msg.disabled} 비활성화`}.`)
                            .setColor(ee.color)
                            .setFooter(ee.footertext, ee.footericon)
                          ).then(msg => {
                            if(msg && msg.deletable) msg.delete({
                                timeout: 4000
                              }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                          });
                        }
                        //otherwise like queue on and track should be off...
                        else {
                          hasmap.delete(message.guild.id)
                          //set track repeat mode off
                          player.setTrackRepeat(false);
                          //set queue repeat mode off
                          player.setQueueRepeat(false);
                          //send informational message
                          message.channel.send(new MessageEmbed()
                            .setTitle(`${emoji.msg.repeat_mode} 재생목록 반복 | ${player.queueRepeat ? `${emoji.msg.enabled} 활성화` : `${emoji.msg.disabled} 비활성화`}.`)
                            .setDescription(`다음 - 재생목록 반복 | ${player.trackRepeat ? `${emoji.msg.enabled} 활성화` : `${emoji.msg.disabled} 비활성화`}.`)
                            .setColor(ee.color)
                            .setFooter(ee.footertext, ee.footericon)
                          ).then(msg => {
                            if(msg && msg.deletable) msg.delete({
                                timeout: 4000
                              }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                          });
                        }
                        break;
                      case String(emoji.react.autoplay_mode):
                        //toggle autoplay
                        player.set("autoplay", !player.get("autoplay"))
                        //Send Success Message
                        message.channel.send(new MessageEmbed()
                          .setTitle(`${emoji.msg.SUCCESS} 성공 | 자동재생 - ${player.get("autoplay") ? `${emoji.msg.enabled} 활성화` : `${emoji.msg.disabled} 비활성화`}`)
                          .setColor(ee.color)
                          .setFooter(ee.footertext, ee.footericon)
                        ).then(msg => {
                          if(msg && msg.deletable) msg.delete({
                              timeout: 4000
                            }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                        });
                        break;
  
                        //////////////////////////////////////
  
                      case String(emoji.react.shuffle):
                        //shuffle the Queue
                        player.queue.shuffle();
                        //send informational message
                        message.channel.send(new MessageEmbed()
                          .setTitle(`${emoji.msg.shuffle} 재생목록이 현재 뒤죽박죽입니다.`)
                          .setColor(ee.color)
                          .setFooter(ee.footertext, ee.footericon)
                        ).then(msg => {
                          if(msg && msg.deletable) msg.delete({
                              timeout: 4000
                            }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                        });
                        break;
                      case String(emoji.react.show_queue):
                        //define the Embed
                        var embed = new MessageEmbed()
                          .setAuthor(`${message.guild.name}  -  [ ${player.queue.length} 개 ]`, message.guild.iconURL({
                            dynamic: true
                          }))
                          .setColor(ee.color);
                        //if there is something playing rn, then add it to the embed
                        if (player.queue.current) embed.addField("**0) 재생중인 노래**", `[${player.queue.current.title.substr(0, 35)}](${player.queue.current.uri}) - ${player.queue.current.isStream ? "LIVE STREAM" : format(player.queue.current.duration).split(" | ")[0]} - 요청인: **${player.queue.current.requester.tag}**`);
                        //get the right tracks of the current tracks
                        var tracks = player.queue;
                        //if there are no other tracks, information
                        if (!tracks.length)
                          return message.channel.send(embed.setDescription(`${emoji.msg.ERROR} 재생목록에 노래가 없습니다.`)).then(msg => {
                            if(msg && msg.deletable) msg.delete({
                                timeout: 4000
                              }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                          });
                        //if not too big send queue in channel
                        if (tracks.length < 15)
                          return message.channel.send(embed.setDescription(tracks.map((track, i) => `**${++i})** [${track.title.substr(0, 35)}](${track.uri}) - ${track.isStream ? "LIVE STREAM" : format(track.duration).split(" | ")[0]} - **요청인: ${track.requester.tag}**`).join("\n"))).then(msg => {
                            if(msg && msg.deletable) msg.delete({
                                timeout: 4000
                              }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                          })
                        //get an array of quelist where 15 tracks is one index in the array
                        var quelist = [];
                        for (var i = 0; i < tracks.length; i += 15) {
                          var songs = tracks.slice(i, i + 15);
                          quelist.push(songs.map((track, index) => `**${i + ++index})** [${track.title.split("[").join("{").split("]").join("}").substr(0, 35)}](${track.uri}) - ${track.isStream ? "LIVE STREAM" : format(track.duration).split(" | ")[0]} - **요청인: ${track.requester.tag}**`).join("\n"))
                        }
                        var limit = quelist.length <= 5 ? quelist.length : 5
                        for (var i = 0; i < limit; i++) {
                          await user.send(embed.setDescription(String(quelist[i]).substr(0, 2048)));
                        }
                        user.send(new MessageEmbed()
                          .setDescription(`${emoji.msg.SUCCESS} <#${message.channel.id}>${quelist.length <= 5 ? "" : "\n참고: -"}`)
                          .setColor(ee.color)
                          .setFooter(ee.footertext, ee.footericon)
                        )
                        message.channel.send(new MessageEmbed()
                          .setTitle(`${emoji.msg.SUCCESS} 재생목록을 보려면 메시지를 확인해주세요!`)
                          .setColor(ee.color)
                          .setFooter(ee.footertext, ee.footericon)
                        ).then(msg => {
                          if(msg && msg.deletable) msg.delete({
                              timeout: 4000
                            }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                        });
  
                        break;
                      case String(emoji.react.show_current_track):
                        //Send Now playing Message
                        return message.channel.send(new MessageEmbed()
                          .setAuthor("현재 재생중인 노래", user.displayAvatarURL({
                            dynamic: true
                          }))
                          .setThumbnail(`https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`)
                          .setURL(player.queue.current.uri)
                          .setColor(ee.color)
                          .setFooter(ee.footertext, ee.footericon)
                          .setTitle(`${player.playing ? emoji.msg.resume : emoji.msg.pause} **${player.queue.current.title}**`)
                          .addField(`${emoji.msg.time} 길이: `, "`" + format(player.queue.current.duration) + "`", true)
                          .addField(`${emoji.msg.song_by} 출처: `, "`" + player.queue.current.author + "`", true)
                          .addField(`${emoji.msg.repeat_mode} 재생목록 갯수: `, `${player.queue.length} 개`, true)
                          .addField(`${emoji.msg.time} 진행률: `, createBar(player))
                          .setFooter(`요청인: ${player.queue.current.requester.tag}`, player.queue.current.requester.displayAvatarURL({
                            dynamic: true
                          }))
                        ).then(msg => {
                          if(msg && msg.deletable)   msg.delete({
                              timeout: 4000
                            }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                        });
                        break;
                    }
                  } catch (e) {
                    console.log(e) /* */
                  }
                });
              })
          } catch (e) {
            console.log(String(e.stack).yellow) /* */
          }
        })
        .on("trackStuck", (player, track, payload) => {
          var embed = new MessageEmbed()
            .setTitle(`${emoji.msg.ERROR} 트랙이 막혔습니다!`)
            .setDescription(`${emoji.msg.skip_track} 트랙을 건너뛰었습니다. [${track.title}](${track.uri})`)
            .setThumbnail(`https://img.youtube.com/vi/${track.identifier}/mqdefault.jpg`)
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon);
          client.channels.cache
            .get(player.textChannel)
            .send(embed).then(msg => {
              if(msg && msg.deletable) msg.delete({
                  timeout: 7500
                }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
            });
          player.stop();
        })
        .on("trackError", (player, track, payload) => {
          var embed = new MessageEmbed()
            .setTitle(`${emoji.msg.ERROR} 트랙에 오류가 발생했습니다.`)
            .setDescription(`${emoji.msg.skip_track} 트랙을 건너뛰었습니다. **${track.title}**`)
            .setThumbnail(`https://img.youtube.com/vi/${track.identifier}/mqdefault.jpg`)
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon);
          player.stop();
          client.channels.cache
            .get(player.textChannel)
            .send(embed).then(msg => {
              if(msg && msg.deletable) msg.delete({
                  timeout: 7500
                }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
            });
  
        })
        .on("queueEnd", async (player) => {
          // "uncomment" to enable trackEnd also for one song long Queus
          // client.manager.emit("trackEnd", player, track)
          databasing(client, player.guild, player.get("playerauthor"));
          if (player.get("autoplay")) return autoplay(client, player);
          //DEvar TIME OUT
          if (config.settings.LeaveOnEmpty_Queue.enabled) {
            setTimeout(async () => {
              try {
                player = client.manager.players.get(player.guild);
                if (!player.queue || !player.queue.current) {
                  var embed = new MessageEmbed()
                    embed.setTitle(`${emoji.msg.ERROR} 재생목록이 종료되었습니다.`)
                    embed.setDescription(`채널 나감: ${client.channels.cache.get(player.voiceChannel) ? client.channels.cache.get(player.voiceChannel).name : "UNKNOWN"} 재생목록이 비어있음: ${ms(config.settings.LeaveOnEmpty_Queue.time_delay, { long: true })}`)
                    embed.setColor(ee.wrongcolor)
                    embed.setFooter(ee.footertext, ee.footericon);
                  var irc = await isrequestchannel(client, player.textChannel, player.guild);
                  if(irc) edit_request_message_track_info(client, player);
                  //if        player afk                              or      guild afk     is enbaled return and not destroy the PLAYER
                  if (player.get(`afk-${player.get("playerauthor")}`) || player.get(`afk-${player.guild}`))
                    return client.channels.cache.get(player.textChannel).send(embed.setDescription(`채널에서 나가지 않습니다. 프리미엄이 [ ✔ enabled ] 활성화되었기 때문입니다.`)).then(msg => {
                        if(msg && msg.deletable) msg.delete({
                          timeout: 4000
                        }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                    });
                  
                  //send information message
                  client.channels.cache.get(player.textChannel).send(embed).then(msg => {
                    if(msg && msg.deletable) msg.delete({
                        timeout: 4000
                      }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                  });
  
                    client.channels.cache
                      .get(player.textChannel)
                      .messages.fetch(player.get("playermessage")).then(msg => {
                        if(msg && msg.deletable) msg.delete({
                            timeout: 4000
                          }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
                      });
                  var irc5 = await isrequestchannel(client, player.textChannel, player.guild);
                  if(irc5) return edit_request_message_track_info(client, player, player.queue.current, "destroy");
                  player.destroy();
                }
              } catch (e) {
                console.log(String(e.stack).yellow);
              }
            }, config.settings.LeaveOnEmpty_Queue.time_delay);
          }
        });
  };