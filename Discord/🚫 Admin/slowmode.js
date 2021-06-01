const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
module.exports = {
  name: `슬로우모드`,
  category: `🚫 Admin`,
  aliases: [`slow`, `slowmode`],
  description: `채널의 슬로우모드를 적용합니다.`,
  usage: `슬로우모드 <시간>`,
  memberpermissions: [`ADMINISTRATOR`],
  run: async (client, message, args, cmduser, text, prefix) => {
    try {
      if (!isNaN(args[0]) || parseInt(args[0]) < 0) {
        message.channel.setRateLimitPerUser(args[0]);
        message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.SUCCESS} 성공 | 슬로우 모드가 설정되었습니다. | **${args[0]}초**`)
        );
      } else {
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${emoji.msg.ERROR} 오류 | 입력이 숫자가 아닙니다.`)
          .setDescription(`사용법: \`${prefix}슬로우모드 <시간>\`\n\n예: \`${prefix}슬로우모드 5\``)
        );
      }
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

