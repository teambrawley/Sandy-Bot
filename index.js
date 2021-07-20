function on(discord, client, mongo){
  client.on('message', async message => {
const prefix = `<@!${client.user.id}>`;

  const enterVanityCode = new discord.MessageEmbed()
    .setTitle(`Hi There, ${message.author.tag}`)
    .setDescription("**Getting Started**\n\nEncrypt your server with **Sandy**. It allows you to verify every user that joins your server. Click [here](https://brawley.js.org) to learn more.\n\n`You'll have to choose a vanity code (where users can verify themselves) and send it here in this channel (You Have 15 Seconds).`")
    .setTimestamp()
    .setFooter('https://brawley.js.org');

  const typeConfirm = new discord.MessageEmbed()
    .setDescription("**Accept The Service Rules**\n\n**#1.** Abide by the Terms of Service\n**Discord :** https://discord.com/terms\n**Sandy :** https://brawley.js.org \n\n**#2.** Don't defeat the purpose,  please don't use this service if you don't need it. This server shouldn't have any invite links so users couldn't access without verification.\n\n**#4.** We have rights to collect any data from this server.\n\n**Type** `accept` **to accept the rules**");

  const securityLevel = new discord.MessageEmbed()
    .setTitle('Choose A Security Level')
    .setDescription('**Strict Levels :**\n\n\n**1 : Members must have a verified email on their Discord account.**\n\n**2 : Members must also be registered on Discord for longer than `x` minutes. ( Please specify )**\n\n**3 : Members must also join at least 3 servers.**\n\n**4 : Members must also use the password to join. ( Please specify )**\n\n**5 : Members must also register their account with specific domain name. ( Please specify )**\n\nPlease reply with **Numbers** ( 1-4 ). If you choose level 2 and above, you should reply with something like this :\n```fix\n5|10|password|example.com```');
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(' '),
   command = args.shift().toLowerCase(),
   db = await mongo.findOne({ guildID: message.guild.id });
  if (command == "setup") { /* 1 */
    if (message.member.hasPermission('ADMINISTRATOR')) { /* 2 */
      if (!db) { /* 3 */
        message.ireply(enterVanityCode).then((m) => { /* 4 */
          const filter = m => m.content;
          const collector1 = message.channel.createMessageCollector(filter, { time: 15000 });
          collector1.on('collect', async a => { /* 5 */
            const vanity = a.content;
            const check = await mongo.findOne({ vanity: vanity });
            if (check) {
              message.ireply('This Vanity Link Was Exist, Please Try Again');
            } else { /* 6 */
              collector1.stop();
              m.edit(securityLevel).then((b) => { /* 7 */
                const filter = b => b.content;
                const collector2 = message.channel.createMessageCollector(filter, { time: 30000 });

                collector2.on('collect', async c => { /* 8 */
                  if (c.content) { /* 9 */
                    collector2.stop();
                    let object;
                    const options = c.content.split("|");
                    if (options[0] < 1 || options[0] > 5) {
                      return m.edit({ embed: { description: '**Please Specify A Security Level Between 1 - 5 **' } });
                    }
                    if (options[0] == "2" && options.length < 2) {
                      return m.edit({ embed: { description: '**Please Specify x minutes**' } });
                    }
                    if (options[0] == "3" && options.length < 2) {
                      return m.edit({ embed: { description: '**Please Specify x minutes**' } });
                    }
                    if (options[0] == "4" && options.length < 3) {
                      return m.edit({ embed: { description: '**Please Specify a password & x minutes**' } });
                    }
                    if (options[0] == "5" && options.length < 4) {
                      return m.edit({ embed: { description: '**Please Specify x minutes, password & email domain name**' } });
                    }
                    if (options[0] == "5" && options.length > 3) {
                      let schema5 = Joi.object({
                        level: Joi.number().required().min(5).max(5),
                        mins: Joi.number().required().min(1),
                        requiredServer: Joi.number().required().min(3).max(3),
                        domain: Joi.string().domain({ tlds: true }).required(),
                        password: Joi.string().required()
                      })
                      object = {
                        level: options[0],
                        mins: options[1],
                        domain: options[3],
                        requiredServer: 3,
                        password: options[2]
                      }
                      try {
                        await schema5.validateAsync(object);
                      } catch (e) {
                        console.log(e)
                        return m.edit({ embed: { description: '**Something Went Wrong**' } });
                      }
                    }

                    if (options[0] == "4" && options.length > 2) {
                      let schema4 = Joi.object({
                        level: Joi.number().required().min(4).max(4),
                        mins: Joi.number().required().min(1),
                        requiredServer: Joi.number().required().min(3).max(3),
                        password: Joi.string().required()
                      })
                      object = {
                        level: options[0],
                        mins: options[1],
                        requiredServer: 3,
                        password: options[2]
                      }
                      try {
                        await schema4.validateAsync(object);
                      } catch (e) {
                        console.log(e)
                        return m.edit({ embed: { description: '**Something Went Wrong**' } });
                      }
                    }
                    if (options[0] == "3" && options.length > 1) {
                      let schema3 = Joi.object({
                        level: Joi.number().required().min(1).max(4),
                        mins: Joi.number().required().min(1),
                        requiredServer: Joi.number().required().min(3).max(3)
                      })
                      object = {
                        level: options[0],
                        mins: options[1],
                        requiredServer: 3
                      }
                      try {

                        await schema3.validateAsync(object);

                      } catch (e) {
                        return m.edit({ embed: { description: '**Something Went Wrong**' } });
                      }
                    }
                    if (options[0] == "2" && options.length > 1) {
                      let schema2 = Joi.object({
                        level: Joi.number().required().min(1).max(4),
                        mins: Joi.number().required().min(1)
                      });
                      object = {
                        level: options[0],
                        mins: options[1],
                      }
                      try {

                        await schema2.validateAsync(object);

                      } catch (e) {
                        return m.edit('**Something Went Wrong**');
                      }
                    }
                    if (options[0] == "1") {
                      object = {
                        level: options[0],
                      }
                      let schema1 = Joi.object({
                        level: Joi.number().required().min(1).max(4),
                      });
                      try {
                        await schema1.validateAsync(object);

                      } catch (e) {
                        return m.edit({ embed: { description: '**Something Went Wrong**' } })
                      }

                    }
                    if (options[0] == "2" && options[1] == '') {
                      return m.edit({ embed: { description: '**Please specify x minutes**' } })
                    }
                    if (options[0] == "3" && options[1] == '') {
                      return m.edit({ embed: { description: '**Please specify x minutes**' } })
                    }
                    if (options[0] == "4" && options[1 || 2] == '') {
                      return m.edit({ embed: { description: '**Please specify x minutes, password**' } })
                    }
                    if (options[0] == "5" && options[1 || 2 || 3] == '') {
                      return m.edit({ embed: { description: '**Please specify x minutes, password & email domain name**' } })
                    }
                    if (!object) {
                      return m.edit({ embed: { description: '**Something Went Wrong**' } });
                    }
       
                    m.edit(typeConfirm).then((d) => { /* 10 */
                      const newGuild = new mongo({
                        guildID: message.guild.id,
                        userID: message.author.id,
                        vanity: vanity,
                        option: object,
                        lastUpdated: new Date()
                      });
                      const filter = d => d.content.toLowerCase().includes('accept');
                      const collector3 = message.channel.createMessageCollector(filter, { time: 15000 });
                      collector3.on('collect', async f => {/* 12 */
                        if (f.content.toLowerCase() == "accept") {

                          newGuild.save().then((res) => { /* 13 */
                            console.log(res);
                            collector3.stop();
                            m.edit({ embed: { description: `**Setup successfully !**\n\n Now you may use https://brawley.js.org/invite/${res.vanity} as your primary server invite link.` } });

                          })/* 13 */
                        }
                      }) /* 12 */
                    }) /* 10 */
                  }  /* 9 */
                }) /* 8 */

              }) /* 7 */

            }/* 6 */
          }) /* 5 */

        })/* 4 */

      } else {
        message.ireply('exist')

      } /* 3 */
    } /* 2 */
  } /* 1 */


  if (command == "raze") {
    if (message.member.hasPermission('ADMINISTRATOR')) {
      if (!db) {
        message.reply("You Haven't Setup Yet")
      } else {
        message.ireply('Are you sure, type confirm to confirm').then((m) => {
          const filter = m => m.content
          const collector = message.channel.createMessageCollector(filter, { time: 15000 });
          collector.on('collect', m => {
            if (m.content.toLowerCase() == "confirm") {
              mongo.deleteOne({ guildID: message.guild.id }).then(() => {
                message.ireply('Alright, Deleted')
              })
              collector.stop()
            } else {
              message.ireply('Seems Like You Have Changed Your Mind')
              collector.stop()

            }
          })
        })
      }

    }
  }
})



client.on('ready', () => {
  console.log(client.user.tag)
  client.user.setActivity('Firewall', { type: 'PLAYING' });

});
}

module.exports = on;
