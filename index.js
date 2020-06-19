if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

const Discord = require('discord.js')
const client = new Discord.Client()

const prefix = "!"

const apiUrl = `https://us-central1-domaincord-market.cloudfunctions.net/api`
const admin = require("firebase-admin");

const serviceAccount = process.env.NODE_ENV === 'development' 
  ? admin.credential.cert(require("./serviceAccountKey.json"))
  : admin.credential.applicationDefault()

admin.initializeApp({
  credential: serviceAccount,
  databaseURL: "https://domaincord-market.firebaseio.com"
});

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)
  await client.user.setActivity('SELL! SELL! SELL!');
})

client.on('message', async msg => {
  if (msg.author.bot) return

  // Regex to match a domain name in a string without a sub-domain  /([a-z]{2,3}\.){1,2}[a-z0-9-]+/g
  // requires reversing the entire message string first, doing the pattern search, then reversing back.
  
  if (msg.content.indexOf(prefix) === 0) {
     const args = msg.content
        .slice(prefix.length)
        .trim()
        .split(/ +/g)

      const command = args
        .shift()
        .toLowerCase()
        .replace('/', '')

      try {
        const commandFile = require(path.join(
          __dirname,
          'commands',
          `${command}.js`
        ))
        commandFile.run(msg, args)
      } catch (err) {
        console.error(err)
      }
  }

  const domainsInReverse = msg.content.split('').reverse().join('').match(/([a-zA-Z]{2,}\.){1,2}[a-zA-Z0-9-]+/g)
  const domains = domainsInReverse.map(domain => domain.split('').reverse().join(''))

  console.log({domains, domainsInReverse})

  if (domains.length) {
    try {
      const promptFile = require('./prompts/listing.js')
      promptFile.run(msg, domains)
    } catch (err) {
      console.error(err)
    }
  }

})

client.on('messageReactionAdd', async (messageReaction, user) => {
  const { message } = messageReaction
})

client.login(process.env.TOKEN)

module.exports = {
  apiUrl,
  admin,
  client
}