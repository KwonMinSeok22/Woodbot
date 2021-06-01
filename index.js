const Discord = require("discord.js");
const colors = require("colors");
const Enmap = require("enmap");     
const moment = require('moment');
const fs = require("fs");
const client = new Discord.Client({
  fetchAllMembers: false,
  restTimeOffset: 0,
  shards: "auto",
  restWsBridgetimeout: 100,
  disableEveryone: true,
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

require('events').EventEmitter.defaultMaxListeners = 100;
process.setMaxListeners(100);

["clientvariables", "Discord", "events", "erelahandler", "requestreacts", "Twitch", "Youtube"].forEach(handler => {
  require(`./handlers/${handler}`)(client);
});
    
client.premium = new Enmap({ name: "premium", dataDir: "./databases/premium" })
client.stats = new Enmap({ name: "stats", dataDir: "./databases/stats" })
client.settings = new Enmap({ name: "setups", dataDir: "./databases/settings" })
client.setups = new Enmap({ name: "setups", dataDir: "./databases/setups" })
client.queuesaves = new Enmap({ name: "queuesaves", dataDir: "./databases/queuesaves", ensureProps: false })
client.modActions = new Enmap({ name: 'actions', dataDir: "./databases/warns" });
client.userProfiles = new Enmap({ name: 'userProfiles', dataDir: "./databases/warns" });

client.login(require("./botconfig/config.json").token);

process.on('unhandledRejection', (reason, p) => {
  console.log('ignore that log'.gray);
});
process.on("uncaughtException", (err, origin) => {
  console.log('ignore that log'.gray);
})
process.on('uncaughtExceptionMonitor', (err, origin) => {
  console.log('ignore that log'.gray);
});
process.on('beforeExit', (code) => {
  console.log('ignore that log'.gray);
});
process.on('exit', (code) => {
  console.log('ignore that log'.gray);
});
process.on('multipleResolves', (type, promise, reason) => {
  console.log('ignore that log'.gray);
});

/*
process.on('unhandledRejection', (reason, p) => {
  console.log('=== unhandled Rejection ==='.toUpperCase());
  console.log('Promise: ', p , 'Reason: ', reason.stack ? reason.stack : reason);
  console.log('=== unhandled Rejection ==='.toUpperCase());
});
process.on("uncaughtException", (err, origin) => {
  console.log('=== uncaught Exception ==='.toUpperCase());
  console.log('Origin: ', origin, 'Exception: ', err.stack ? err.stack : err)
  console.log('=== uncaught Exception ==='.toUpperCase());
})
process.on('uncaughtExceptionMonitor', (err, origin) => {
  console.log('=== uncaught Exception Monitor ==='.toUpperCase());
  console.log('Origin: ', origin, 'Exception: ', err.stack ? err.stack : err)
  console.log('=== uncaught Exception Monitor ==='.toUpperCase());
});
process.on('beforeExit', (code) => {
  console.log('=== before Exit ==='.toUpperCase());
  console.log('Code: ', code);
  console.log('=== before Exit ==='.toUpperCase());
});
process.on('exit', (code) => {
  console.log('=== exit ==='.toUpperCase());
  console.log('Code: ', code);
  console.log('=== exit ==='.toUpperCase());
});
process.on('multipleResolves', (type, promise, reason) => {
  console.log('=== multiple Resolves ==='.toUpperCase());
  console.log(type, promise, reason);
  console.log('=== multiple Resolves ==='.toUpperCase());
});*/

client.on('guildMemberAdd', async (member) => {
  const Channel = member.guild.channels.cache.get('750617569584742402') 

  const embed = new Discord.MessageEmbed()
    .setColor('GREEN')
    .setTitle(`환영합니다!`)
    .setDescription(`
        > 서버이름: **${member.guild.name}**
        > 닉네임: <@${member.id}>
        > 멤버: **${member.guild.memberCount}명**`)

  Channel.send(embed)
})
client.on('guildMemberRemove', async (member) => { 
  const Channel = member.guild.channels.cache.get('750617617919770635')

  const embed = new Discord.MessageEmbed()
    .setColor('RED')
    .setTitle(`안녕히가세요.`)
    .setDescription(`
        > 서버이름: **${member.guild.name}**
        > 닉네임: <@${member.id}>
        > 멤버: **${member.guild.memberCount}명**`)

  Channel.send(embed)
})
client.on('guildMemberAdd', (member) => {
  const Channel = member.guild.channels.cache.get('845204067251650580')
  const role = member.guild.roles.cache.find(mr => mr.name === '───Permissions───')
  const role1 = member.guild.roles.cache.find(mr => mr.name === '───Roles───')
  member.roles.add(role)
  member.roles.add(role1)
  const embed = new Discord.MessageEmbed()
    .setColor('GREEN')
    .setTitle(`환영로그`)
    .setDescription(`
        > 서버이름: **${member.guild.name}**
        > 닉네임: <@${member.id}>
        > 아이디: ${member.id}
        > 기본 제공 역할: 
          **${role.name}**
          **${role1.name}** 
        > 계정생성 일: ${moment(member.user.createdTimestamp).format('LT')} ${moment(member.user.createdTimestamp).format('LL')}   ${moment(member.user.createdTimestamp).fromNow()}
        
        관리자분들 의심되는 아이디나 계정생성 일을 확인해주세요!`)
    .setTimestamp()
  Channel.send(embed)
});

client.on('messageReactionAdd', async(reaction, user) => {
  if(reaction.message.partial) await reaction.message.fetch();
  if(reaction.partial) await reaction.fetch();
  if(user.bot) return;
  if(!reaction.message.guild) return;
  if(reaction.message.id === '845220737732313109'){
      if(reaction.emoji.name === '💬') {
          await reaction.message.guild.members.cache.get(user.id).roles.add('802464395506221086')
          user.send(`${message.guild.name} 커뮤니티 역할을 선택하셨습니다.`)
      }
  }
})
client.on('messageReactionRemove', async(reaction, user) => {
  if(reaction.message.partial) await reaction.message.fetch();
  if(reaction.partial) await reaction.fetch();
  if(user.bot) return;
  if(!reaction.message.guild) return;
  if(reaction.message.id === '845220737732313109'){
      if(reaction.emoji.name === '💬') {
          await reaction.message.guild.members.cache.get(user.id).roles.remove('802464395506221086')
          user.send(`${message.guild.name} 커뮤니티 역할을 삭제하셨습니다.`)
      }
  }
})