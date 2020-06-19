/**
 * All rights to this file belong to @domaincord (github.com/domaincord)
 */

const { DB } = require('../utils/');
const { RichEmbed } = require('discord.js');

exports.run = async (message, args) => {
  if (!args || args.length === 0)
    return message.reply(
      'Must provide the domain to be requested for appraisal'
    );

  const domain = args
    .join(' ')
    .trim()
    .toLowerCase();

  if (domain.includes(' '))
    return message.reply('Domain name cannot contain spaces');

  const ref = await DB.getDatabase().ref(`/domains/`);
  const data = await ref.once('value');

  let exists = false;

  data.forEach(d => {
    if (d.val().domain === domain && d.val().userID === message.author.id)
      exists = true;
  });

  if (!exists) return message.reply('No such domain found under your domains');

  const refAppraisals = await DB.getDatabase().ref(`/appraisals/`);
  const dataAppraisals = await refAppraisals.once('value');

  const appraisals = [];

  if (dataAppraisals.numChildren() > 1) {
    dataAppraisals.forEach(d => {
      if (d.val().domain === domain) appraisals.push(d.val().value);
    });
  } else if (dataAppraisals.val()) {
    appraisals.push(dataAppraisals.val().value);
  }

  return message.channel.send(
    new RichEmbed({
      title: domain,
      description: `Total appraisals: ${
        appraisals.length
      }\n\n**Breakdown**\n${appraisals
        .map((a, i) => `• Appraisal #${i + 1}: $${a}`)
        .join('\n')}\n\nThe Average appraisal value of your domain is **$${(
        appraisals.reduce((a, b) => a + b, 0) / appraisals.length
      )
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}**`,
      color: 0x2196f3,
    })
  );
};
