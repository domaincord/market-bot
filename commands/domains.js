/**
 * All rights to this file belong to @domaincord (github.com/domaincord)
 */

const { DB } = require('../utils/');

exports.run = async (message, args) => {
  const ref = await DB.getDatabase().ref('/domains');
  const data = await ref.once('value');

  const userDomains = [];

  data.forEach(d => {
    if (d.val().userID === message.author.id) userDomains.push(d.val());
  });

  if (userDomains.length > 0)
    return message.reply(
      `Here are your domains:\n\n ${userDomains
        .map(d => `• ${d.domain}`)
        .join('\n')}`
    );

  return message.reply('No domains found');
};
