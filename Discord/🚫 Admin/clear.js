const {
    MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
const {
    delay
} = require(`../../handlers/functions`);
module.exports = {
    name: `청소`,
    aliases: [`clear`, `purge`, `채팅청소`],
    category: `🚫 Admin`,
    description: `텍스트 채널의 메시지 또는 텍스트 채널의 지정된 메시지 수를 삭제합니다.`,
    usage: `청소 <삭제할 메시지의 수>`,
    memberpermissions: [`MANAGE_MESSAGES`],
    run: async (client, message, args) => {
        try {
            clearamount = Number(args[0]);
            if (clearamount >= 1 && clearamount <= 100) {
                message.channel.bulkDelete(clearamount).catch(e => console.log("Couldn't delete msg, this is for preventing a bug".gray));
            } else {
                let limit = clearamount > 1000 ? 1000 : clearamount;
                for (let i = 100; i <= limit; i += 100) {
                    try {
                        await message.channel.bulkDelete(i).catch(e => console.log("Couldn't delete msg, this is for preventing a bug".gray));
                    } catch {}
                    await delay(1500);
                }
            }
            message.channel.send(new MessageEmbed()
                .setColor(ee.color)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(`${emoji.msg.SUCCESS} ${clearamount}만큼 메시지를 지웠습니다.`)
            ).then(msg => msg.delete({
                timeout: 5000
            })).catch(e => console.log("Couldn't delete msg, this is for preventing a bug".gray));
        } catch (e) {
            console.log(String(e.stack).red);
            return message.channel.send(new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(`${emoji.msg.ERROR} 오류 | 오류가 발생했습니다.`)
                .setDescription(`\`\`\`${e.message}\`\`\``)
            );
        }
    }
}
