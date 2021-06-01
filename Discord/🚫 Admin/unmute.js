const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
const ms = require(`ms`);
const {
  MessageEmbed
} = require(`discord.js`)
module.exports = {
  name: `뮤트해제`,
  category: `🚫 Admin`,
  aliases: [`unmute`],
  cooldown: 4,
  usage: `뮤트해제 @유저`,
  description: `뮤트를 해제 합니다.`,
  memberpermissions: [`KICK_MEMBERS`],
  run: async (client, message, args, cmduser, text, prefix) => {
    try {
      let member = message.mentions.members.first();
      if (!member)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 멤버 이름을 입력해주세요.`)
          .setDescription(` 사용법: \`${prefix}뮤트해제 @유저\`\n\n예: \`${prefix}뮤트해제 @유저\``)
        );
      args.shift();
      if (member.roles.highest.position >= message.member.roles.highest.position)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 이 구성원은 사용자의 범위 위치와 같으므로 음소거할 수 없습니다!`)
        );

      let allguildroles = message.guild.roles.cache.array();
      let mutedrole = false;
      for (let i = 0; i < allguildroles.length; i++) {
        if (allguildroles[i].name.toLowerCase().includes(`muted`)) {
          mutedrole = allguildroles[i];
          break;
        }
      }
      if (!mutedrole) {
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 멤버를 음소거한 적이 없습니다. 아직 음소거 역할이 없습니다!`)
        );
      }
      if (mutedrole.position > message.guild.me.roles.highest.position) {
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 역할이 내 위에 있기 때문에 액세스할 수 없습니다!`)
        );
      }
      try {
        member.roles.remove(mutedrole);
      } catch (e) {
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 시간을 입력해주세요!`)
          .setDescription(`사용법: \`${prefix}뮤트 @유저 <Time+Format(e.g: 10m)> [사유]\`\n\n예: \`${prefix}뮤트 @유저 10m 욕을 하셨습니다!\``)
        );
      }
      message.channel.send(new MessageEmbed()
        .setColor(ee.color)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(`${emoji.msg.SUCCESS} 성공 | \`${member.user.tag}\` 뮤트 **해제**`)
      );
      member.send(new MessageEmbed()
        .setColor(ee.color)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(`${emoji.msg.SUCCESS} 성공 | \`${message.author.tag}\` 뮤트 해제`)
      );
    } catch (e) {
      console.log(String(e.stack).bgRed)
      return message.channel.send(new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(`${emoji.msg.ERROR} 오류 | 오류가 발생했습니다.`)
        .setDescription(`\`\`\`${e.message}\`\`\``)
      );
    }
  }
};