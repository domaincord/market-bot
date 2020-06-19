const { admin } = require('../index')
const Discord = require('discord.js')

exports.run = async (msg, domains) => {

    // check if domain already has a listing
    const domainListings = await Promise.all(domains.map(getListing))
    const listings = domainListings.filter(listing => listing.data)
    console.log({domainListings, listings})
    const notListed = domainListings.filter(listing => !listing.data)


    // if yes, embed listing info
    if (listings.length) {
        const listingEmbeds = listings.map(listing => new Discord.RichEmbed()
            .setTitle(listing.fqdn)
            .setDescription(`<@${listing.data.userId}> has listed this domain for sale.\n
            See more info at [domaincord.com/listings/${listing.fqdn}](https://domaincord.com/listings/${listing.fqdn})`)
            .addField('Min. Offer', `${listing.data.minOffer} ${listing.data.currencyCode}`, true)
        )
        //listingEmbeds.forEach(embed => msg.channel.send({embed: listingEmbeds[0]}))
        msg.channel.send({embed: listingEmbeds[0]})
    }
  
    // if no, ask if you want to verify and list
    if (notListed.length) {
        const notListedEmbeds = notListed.map(domain => new Discord.RichEmbed()
            .setTitle(domain.fqdn)
            .setDescription(`${domain.fqdn} is not yet listed on Domaincord.\nClick the ✅ reaction to begin the listing process. **Note: DNS verifcation is required.**`)
        )

        const message = await msg.channel.send({embed: notListedEmbeds[0]})
        await message.react('✅')

        const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === msg.member.user.id
        const collector = message.createReactionCollector(filter, { time: 600, maxEmojis: 1, maxUsers: 2, max: 2 });
        collector.on('collect', reaction => {
            if (reaction.me) return
            bootstrapListing(reaction.message.embeds[0].title, msg.member.user, reaction.message)
        });
        collector.on('end', async collected => {
            console.log(`Collected ${collected.size} items`)
            await message.clearReactions()
        });
    }

}

const getListing = async (domain) => {
    const snapshot = await admin.firestore().collection('listings')
        .where('fqdn', '==', domain)
        .where('status', '==', 'ACTIVE')
        .get()
    if (snapshot.size === 0) return {
        fqdn: domain,
        data: null
    }

    const docsData = snapshot.docs.map(doc => {
        return {
            _id: doc.id,
            ...doc.data()
        }
    })

    if (docsData.length > 1) {
        console.log('Warning! More than one listing matches the passed in domain, so only the first domain is being returned.')
    }
   
    return {
        fqdn: domain,
        data: docsData[0]
    }
}

const bootstrapListing = async (domain, user, message) => {
    await admin.firestore().collection('listings').add({
        fqdn: domain,
        status: 'PENDING_SETUP',
        userId: user.id,
        messageId: message.id,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    })
}