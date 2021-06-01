const Discord = require("discord.js");
const {MessageEmbed} = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const emoji = require(`../../botconfig/emojis.json`);
const moment = require('moment');
const flags = {
	DISCORD_EMPLOYEE: '디스코드 임직원',
	DISCORD_PARTNER: '디스코드 파트너',
	BUGHUNTER_LEVEL_1: '버그 헌터 (레벨 1)',
	BUGHUNTER_LEVEL_2: '버그 헌터 (레벨 2)',
	HYPESQUAD_EVENTS: '하이퍼스쿼드 이벤트',
	HOUSE_BRAVERY: '용맹의 집',
	HOUSE_BRILLIANCE: '브릴리언스 가문',
	HOUSE_BALANCE: '하원 균형',
	EARLY_SUPPORTER: '얼리 서포터즈',
	TEAM_USER: '팀 유저',
	SYSTEM: '시스템',
	VERIFIED_BOT: '인증된 봇',
	VERIFIED_DEVELOPER: '인증된 봇 개발자'
};
function  trimArray(arr, maxLen = 10) {
    if (arr.length > maxLen) {
      const len = arr.length - maxLen;
      arr = arr.slice(0, maxLen);
      arr.push(`${len} more...`);
    }
    return arr;
  }
module.exports = {
  name: "유저정보",
  aliases: ["멤버정보"],
  category: "🔰 Info",
  description: "유저 정보를 확인할 수 있습니다.",
  usage: "유저정보 [@유저]",
  run: async (client, message, args, cmduser, text, prefix) => {
    try {
      
      const user = message.mentions.users.first() || message.author;
      if (!user)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(":x: 오류 | 정보를 찾고자하는 유저를 입력해주세요.")
        );
        const member = message.mentions.members.last() || message.member;
        const roles = member.roles.cache
          .sort((a, b) => b.position - a.position)
          .map(role => role.toString())
          .slice(0, -1);
        const userFlags = member.user.flags.toArray();
        const embeduserinfo = new MessageEmbed()
        try{embeduserinfo.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))}catch{}
        try{embeduserinfo.setAuthor("정보   " + member.user.username + "#" + member.user.discriminator, member.user.displayAvatarURL({ dynamic: true }))}catch{}
        try{embeduserinfo.addField('**❯ 닉네임:**',`\`${member.user.username}#${member.user.discriminator}\``,true)}catch{}
        try{embeduserinfo.addField('**❯ 아이디:**',`\`${member.id}\``,true)}catch{}
        try{embeduserinfo.addField('**❯ 아바타:**',`[\`아바타 링크\`](${member.user.displayAvatarURL({ format: "png" })})`,true)}catch{}
        try{embeduserinfo.addField('**❯ 계정 생성일:**',`\`${moment(member.user.createdTimestamp).format('LT')} ${moment(member.user.createdTimestamp).format('LL')}   ${moment(member.user.createdTimestamp).fromNow()}\``,true)}catch{}
        try{embeduserinfo.addField('**❯ 서버 입장일:**',`\`${moment(member.joinedAt).format('LL LTS')}\``,true)}catch{}
        try{embeduserinfo.addField('**❯ 플래그:**',`\`${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'None'}\``,true)}catch{}
        try{embeduserinfo.addField('**❯ 스텟:**',`\`${member.user.presence.status}\``,true)}catch{}
        try{embeduserinfo.addField('**❯ 게임:**',`\`${member.user.presence.game || '게임을 플레이 하지 않고 있었습니다.'}\``,true)}catch{}
        try{embeduserinfo.addField('**❯ 가장 높은 역할:**',`${member.roles.highest.id === message.guild.id ? 'None' : member.roles.highest}`,true)}catch{}
        try{embeduserinfo.addField(`**❯ \`${roles.length}\` 역할:**`,`${roles.length < 10 ? roles.join('\n') : roles.length > 10 ? this.trimArray(roles) : 'None'}`)}catch{}
        embeduserinfo.setColor(ee.color)
        embeduserinfo.setFooter(ee.footertext, ee.footericon)

      message.channel.send(embeduserinfo)
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
}