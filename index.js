require('dotenv').config()

const fs = require('fs')
const Discord = require('discord.js')
const client = new Discord.Client()

const prefix = process.env.PREFIX

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://domaincord-market.firebaseio.com"
});

const db = admin.firestore();

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)
  await client.user.setActivity('Tracking member points!');
})

client.on('message', msg => {
  if (msg.author.bot) return
  
  if (msg.content.indexOf(prefix) === 0) {
     const args = msg.content
        .slice(prefix.length)
        .trim()
        .split(/ +/g)

      const command = args
        .shift()
        .toLowerCase()
        .replace('/', '')
  }
})

client.login(process.env.TOKEN)