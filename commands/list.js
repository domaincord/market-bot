const Discord = require("discord.js");
const { Client, Config } = require('../utils/');

exports.run = (message, args) => {
   // !list [domain] [price] [registrar] [optional notes]
   let domain, price, registrar, notes, status;
   let isMakeOffer = false;
   let hasFlags = false;

   if (args.length >= 3) {
      let marketType = args.filter(item => {
         return item.startsWith("-")
      })
      if (marketType.length > 0) {
         hasFlags = true
         marketType.map((mt, i) => {
            args.splice(i, 1)
         })
         let flag = marketType[0].replace(/-/g, '').slice(0,1).toUpperCase()
         switch (flag) {
            case "N":
               status = "Negotiable"
               break
            case "F":
               status = "Fixed Price"
               break
            case "E":
               status = "Established"
               break
            case "O":
               status = "Make Offer"
               isMakeOffer = true
               break 
            default: 
               status = "TBA"
         }
      } else {
         status = "TBA"
      }
      domain = args[0].toUpperCase()
      price = !isMakeOffer ? `$ ${args[1].replace(/\$|£|\.\d+|,/g, '')}` : "???";
      registrar = args[2].replace(/\w+/g, function(w) {return w[0].toUpperCase() + w.slice(1).toLowerCase()});

      if (args.length > 3) {
         notes = args.splice(3, args.length).join(' ')
      } else {
         notes = "No additional information specified"
      }
      

      const embed = new Discord.RichEmbed()
         .setTitle(`${domain} ${domain.toLowerCase()}`)
         .setAuthor(message.author.username, message.author.avatarURL)
         .setTimestamp();
            
         embed.addField("Status", status, true);
         embed.addField("Price (USD)", price, true);
         embed.addField("Registrar", registrar, true);
         embed.addField("Notes", notes);

      let channel = Config.getChannel('marketplace')
      let guild = Client.getClient().guilds.get(process.env.DISCORD_SERVER_ID)
      guild.channels.get(channel).send({embed});
      if (message.channel.type === "text") {
         message.delete()
      }
      message.channel.send(`<@${message.author.id}>, your domain has been posted in <#${channel}>`)
   } else {
      message.channel.send({embed: {
         color: 0xff0000,
         title: "Invalid Command",
         description: `
\`\`\`
!list -[n|f|e|o] [domain] [price] [registrar] [Optional Notes]

Note: Command Arguments are entered without the square brackets [ ]

KEY:
n = Negotiable
f = Fixed Price
e = Established
o = Make Offer

EXAMPLE USAGE:
!list -f example.com 125000 GoDaddy This is an optional note about my domain...
\`\`\`
         `
       }});
   }
}
