const config = require(`../../botconfig/config.json`);
const ms = require(`ms`);
const ee = require(`../../botconfig/embed.json`)
const emoji = require(`../../botconfig/emojis.json`);
const {
  MessageEmbed
} = require(`discord.js`)
module.exports = {
  name: `뮤트`,
  category: `🚫 Admin`,
  aliases: [`mute`],
  cooldown: 4,
  usage: `뮤트 @유저 <Time+Format(e.g: 10m)> [사유]`,
  description: `특정 시간 동안 멤버를 음소거합니다!`,
  memberpermissions: [`KICK_MEMBERS`],
  run: async (client, message, args, cmduser, text, prefix) => {
    try {
      let member = message.mentions.members.first();
      if (!member)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 멤버를 멘션 해주세요!`)
          .setDescription(`사용법: \`${prefix}뮤트 @유저 <Time+Format(e.g: 10m)> [사유]\`\n\n예: \`${prefix}뮤트 @유저 10m 욕을 하셨습니다!\``)
        );
      args.shift();
      if (member.roles.highest.position >= message.member.roles.highest.position)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 이 멤버은 사용자의 범위 위치와 같으므로 음소거할 수 없습니다!`)
        );

      let time = args[0];
      if (!time)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 시간을 입력해주세요!`)
          .setDescription(`사용법: \`${prefix}뮤트 @유저 <Time+Format(e.g: 10m)> [사유]\`\n\n예: \`${prefix}뮤트 @유저 10m 욕을 하셨습니다!\``)
        );

      args.shift();
      let reason = args.join(` `);
      let allguildroles = message.guild.roles.cache.array();
      let mutedrole = false;
      for (let i = 0; i < allguildroles.length; i++) {
        if (allguildroles[i].name.toLowerCase().includes(`muted`)) {
          mutedrole = allguildroles[i];
          break;
        }
      }
      if (!mutedrole) {
        let highestrolepos = message.guild.me.roles.highest.position;
        mutedrole = await message.guild.roles.create({
          data: {
            name: `muted`,
            color: `#222222`,
            hoist: true,
            position: Number(highestrolepos) - 1
          },
          reason: `이 역할은 구성원을 음소거하기 위해 작성되었습니다!`
        }).catch((e) => {
          console.log(String(e.stack).red);
          message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`${emoji.msg.ERROR} 오류 | 역할을 만들 수 없습니다.`)
          );
        });
      }
      if (mutedrole.position > message.guild.me.roles.highest.position)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 역할이 내 위에 있기 때문에 역할에 액세스할 수 없습니다.`)
        );

      let mutetime;
      try {
        mutetime = ms(time);
      } catch (e) {
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 시간을 입력해주세요!`)
          .setDescription(`사용법: \`${prefix}뮤트 @유저 <Time+Format(e.g: 10m)> [사유]\`\n\n예: \`${prefix}뮤트 @유저 10m 욕을 하셨습니다!\``)
        );
      }

      if (!mutetime || mutetime === undefined) return message.channel.send(new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(`${emoji.msg.ERROR} 오류 | 시간을 입력해주세요!`)
        .setDescription(`사용법: \`${prefix}뮤트 @유저 <Time+Format(e.g: 10m)> [사유]\`\n\n예: \`${prefix}뮤트 @유저 10m 욕을 하셨습니다!\``)
      );
      await message.guild.channels.cache.forEach((ch) => {
        try {
          ch.updateOverwrite(mutedrole, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false,
            CONNECT: false,
            SPEAK: false
          });
        } catch (e) {
          console.log(String(e.stack).red);
        }
      });
      try {
        member.roles.add(mutedrole);
      } catch (e) {
        message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 오류가 발생했습니다.`)
          .setDescription(`\`\`\`${e.message}\`\`\``)
        );
      }

      message.channel.send(new MessageEmbed()
        .setColor(ee.color)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(`${emoji.msg.SUCCESS} 성공 | \`${member.user.tag}\` **뮤트**를 받았습니다. | \`${ms(mutetime, { long: true })}\``)
        .setDescription(`사유:\n> ${reason ? `${reason.substr(0, 1800)}` : `사유 없음`}`)
      );
      member.send(new MessageEmbed()
        .setColor(ee.color)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(`${emoji.msg.SUCCESS} 성공 | \`${message.author.tag}\` **뮤트**를 받았습니다. | \`${ms(mutetime, { long: true })}\``)
        .setDescription(`사유:\n> ${reason ? `${reason.substr(0, 1800)}` : `사유 없음`}`)
      );
      setTimeout(() => {
        try {
          message.channel.send(new MessageEmbed()
            .setColor(ee.color)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`${emoji.msg.SUCCESS} 성공 | \`${member.user.tag}\` **언뮤트**을 받았습니다.\`${ms(mutetime, { long: true })}\``)
            .setDescription(`사유:\n> ${reason ? `${reason.substr(0, 1800)}` : `사유 없음`}`)
          );
          member.roles.remove(mutedrole);
        } catch (e) {
          return message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`${emoji.msg.ERROR} 오류 | 오류가 발생했습니다.`)
            .setDescription(`\`\`\`${e.message}\`\`\``)
          );
        }
      }, mutetime);
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
