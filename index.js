const {
    WAConnection,
    MessageType,
    Presence,
    Mimetype
} = require('@adiwajshing/baileys')
const { color, bgcolor } = require('./lib/color')
const { help } = require('./src/help')
const { wait, simih, getBuffer, h2k, generateMessageID, getGroupAdmins, getRandom, banner, start, info, success, close } = require('./lib/functions')
const { fetchJson } = require('./lib/fetcher')
const { recognize } = require('./lib/ocr')
const fs = require('fs')
const moment = require('moment-timezone')
const { exec } = require('child_process')
const kagApi = require('@kagchi/kag-api')
const fetch = require('node-fetch')
const tiktod = require('tiktok-scraper')
const ffmpeg = require('fluent-ffmpeg')
const { removeBackgroundFromImageFile } = require('remove.bg')
const imgbb = require('imgbb-uploader')
const lolis = require('lolis.life')
const loli = new lolis()
const welkom = JSON.parse(fs.readFileSync('./src/welkom.json'))
const nsfw = JSON.parse(fs.readFileSync('./src/nsfw.json'))
const samih = JSON.parse(fs.readFileSync('./src/simi.json'))
prefix = '!'
blocked = []

function kyun(seconds){
  function pad(s){
    return (s < 10 ? '0' : '') + s;
  }
  var hours = Math.floor(seconds / (60*60));
  var minutes = Math.floor(seconds % (60*60) / 60);
  var seconds = Math.floor(seconds % 60);

  //return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
  return `${pad(hours)} Jam ${pad(minutes)} Menit ${pad(seconds)} Detik`
}

async function starts() {
	const client = new WAConnection()
	client.logger.level = 'warn'
	console.log(banner.string)
	client.on('qr', () => {
		console.log(color('[','white'), color('!','red'), color(']','white'), color(' Scan the qr code above'))
	})
	client.on('credentials-updated', () => {
		fs.writeFileSync('./BarBar.json', JSON.stringify(client.base64EncodedAuthInfo(), null, '\t'))
		info('2', 'Login Info Updated')
	})
	fs.existsSync('./BarBar.json') && client.loadAuthInfo('./BarBar.json')
	client.on('connecting', () => {
		start('2', 'Connecting...')
	})
	client.on('open', () => {
		success('2', 'Connected')
	})
	await client.connect({timeoutMs: 30*1000})

	client.on('group-participants-update', async (anu) => {
		if (!welkom.includes(anu.jid)) return
		try {
			const mdata = await client.groupMetadata(anu.jid)
			console.log(anu)
			if (anu.action == 'add') {
				num = anu.participants[0]
				try {
					ppimg = await client.getProfilePicture(`${anu.participants[0].split('@')[0]}@c.us`)
				} catch {
					ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
				}
				teks = `Halo @${num.split('@')[0]}\nSelamat datang di group *${mdata.subject}*`
				let buff = await getBuffer(ppimg)
				client.sendMessage(mdata.id, buff, MessageType.image, {caption: teks, contextInfo: {"mentionedJid": [num]}})
			} else if (anu.action == 'remove') {
				num = anu.participants[0]
				try {
					ppimg = await client.getProfilePicture(`${num.split('@')[0]}@c.us`)
				} catch {
					ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
				}
				teks = `Sayonara @${num.split('@')[0]}👋`
				let buff = await getBuffer(ppimg)
				client.sendMessage(mdata.id, buff, MessageType.image, {caption: teks, contextInfo: {"mentionedJid": [num]}})
			}
		} catch (e) {
			console.log('Error : %s', color(e, 'red'))
		}
	})
	client.on('CB:Blocklist', json => {
		if (blocked.length > 2) return
	    for (let i of json[1].blocklist) {
	    	blocked.push(i.replace('c.us','s.whatsapp.net'))
	    }
	})

	client.on('message-new', async (mek) => {
		try {
			if (!mek.message) return
			if (mek.key && mek.key.remoteJid == 'status@broadcast') return
			if (mek.key.fromMe) return
			global.prefix
			global.blocked
			const content = JSON.stringify(mek.message)
			const from = mek.key.remoteJid
			const type = Object.keys(mek.message)[0]
			const apiKey = 'Your-Api-Key'
			const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType
			const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
			body = (type === 'conversation' && mek.message.conversation.startsWith(prefix)) ? mek.message.conversation : (type == 'imageMessage') && mek.message.imageMessage.caption.startsWith(prefix) ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption.startsWith(prefix) ? mek.message.videoMessage.caption : (type == 'extendedTextMessage') && mek.message.extendedTextMessage.text.startsWith(prefix) ? mek.message.extendedTextMessage.text : ''
			budy = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : ''
			const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
			const args = body.trim().split(/ +/).slice(1)
			const isCmd = body.startsWith(prefix)

			mess = {
				wait: '⌛ Sedang di Prosess ⌛',
				success: '✔️ Berhasil ✔️',
				error: {
					stick: '❌ Gagal, terjadi kesalahan saat mengkonversi gambar ke sticker ❌',
					Iv: '❌ Link tidak valid ❌'
				},
				only: {
					group: '❌ Perintah ini hanya bisa di gunakan dalam group! ❌',
					ownerG: '❌ Perintah ini hanya bisa di gunakan oleh owner group! ❌',
					ownerB: '❌ Perintah ini hanya bisa di gunakan oleh owner bot! ❌',
					admin: '❌ Perintah ini hanya bisa di gunakan oleh admin group! ❌',
					Badmin: '❌ Perintah ini hanya bisa di gunakan ketika bot menjadi admin! ❌'
				}
			}

			const botNumber = client.user.jid
			const ownerNumber = ["6282286425538@s.whatsapp.net"] // replace this with your number
			const isGroup = from.endsWith('@g.us')
			const sender = isGroup ? mek.participant : mek.key.remoteJid
			const groupMetadata = isGroup ? await client.groupMetadata(from) : ''
			const groupName = isGroup ? groupMetadata.subject : ''
			const groupId = isGroup ? groupMetadata.jid : ''
			const groupMembers = isGroup ? groupMetadata.participants : ''
			const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
			const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
			const isGroupAdmins = groupAdmins.includes(sender) || false
			const isWelkom = isGroup ? welkom.includes(from) : false
			const isNsfw = isGroup ? nsfw.includes(from) : false
			const isSimi = isGroup ? samih.includes(from) : false
			const isOwner = ownerNumber.includes(sender)
			const isUrl = (url) => {
			    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
			}
			const reply = (teks) => {
				client.sendMessage(from, teks, text, {quoted:mek})
			}
			const sendMess = (hehe, teks) => {
				client.sendMessage(hehe, teks, text)
			}
			const mentions = (teks, memberr, id) => {
				(id == null || id == undefined || id == false) ? client.sendMessage(from, teks.trim(), extendedText, {contextInfo: {"mentionedJid": memberr}}) : client.sendMessage(from, teks.trim(), extendedText, {quoted: mek, contextInfo: {"mentionedJid": memberr}})
			}

			colors = ['red','white','black','blue','yellow','green']
			const isMedia = (type === 'imageMessage' || type === 'videoMessage')
			const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
			const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
			const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
			if (!isGroup && isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
			if (!isGroup && !isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mRECV\x1b[1;37m]', time, color('Message'), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
			if (isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
			if (!isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mRECV\x1b[1;37m]', time, color('Message'), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
			switch(command) {
				case 'help':
				case 'menu':
					client.sendMessage(from, help(prefix), text)
					break
				case 'info':
					me = client.user
					uptime = process.uptime()
					teks = `*MR.057* : ${me.name}\n*62822864255387* : @${me.jid.split('@')[0]}\n*Prefix* : ${prefix}\n*Total Block Contact* : ${blocked.length}\n*The bot is active on* : ${kyun(uptime)}`
					buffer = await getBuffer(me.imgUrl)
					client.sendMessage(from, buffer, image, {caption: teks, contextInfo:{mentionedJid: [me.jid]}})
					break
				case 'blocklist':
					teks = 'This is list of blocked number :\n'
					for (let block of blocked) {
						teks += `~> @${block.split('@')[0]}\n`
					}
					teks += `Total : ${blocked.length}`
					client.sendMessage(from, teks.trim(), extendedText, {quoted: mek, contextInfo: {"mentionedJid": blocked}})
					break
				case 'ocr':
					if ((isMedia && !mek.message.videoMessage || isQuotedImage) && args.length == 0) {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await client.downloadAndSaveMediaMessage(encmedia)
						reply(mess.wait)
						await recognize(media, {lang: 'eng+ind', oem: 1, psm: 3})
							.then(teks => {
								reply(teks.trim())
								fs.unlinkSync(media)
							})
							.catch(err => {
								reply(err.message)
								fs.unlinkSync(media)
							})
					} else {
						reply('Foto aja mas')
					}
					break
				case 'stiker':
				case 'sticker':
					if ((isMedia && !mek.message.videoMessage || isQuotedImage) && args.length == 0) {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await client.downloadAndSaveMediaMessage(encmedia)
						ran = getRandom('.webp')
						await ffmpeg(`./${media}`)
							.input(media)
							.on('start', function (cmd) {
								console.log(`Started : ${cmd}`)
							})
							.on('error', function (err) {
								console.log(`Error : ${err}`)
								fs.unlinkSync(media)
								reply(mess.error.stick)
							})
							.on('end', function () {
								console.log('Finish')
								buff = fs.readFileSync(ran)
								client.sendMessage(from, buff, sticker, {quoted: mek})
								fs.unlinkSync(media)
								fs.unlinkSync(ran)
							})
							.addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
							.toFormat('webp')
							.save(ran)
					} else if ((isMedia && mek.message.videoMessage.seconds < 11 || isQuotedVideo && mek.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.seconds < 11) && args.length == 0) {
						const encmedia = isQuotedVideo ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await client.downloadAndSaveMediaMessage(encmedia)
						ran = getRandom('.webp')
						reply(mess.wait)
						await ffmpeg(`./${media}`)
							.inputFormat(media.split('.')[1])
							.on('start', function (cmd) {
								console.log(`Started : ${cmd}`)
							})
							.on('error', function (err) {
								console.log(`Error : ${err}`)
								fs.unlinkSync(media)
								tipe = media.endsWith('.mp4') ? 'video' : 'gif'
								reply(`❌ Gagal, pada saat mengkonversi ${tipe} ke stiker`)
							})
							.on('end', function () {
								console.log('Finish')
								buff = fs.readFileSync(ran)
								client.sendMessage(from, buff, sticker, {quoted: mek})
								fs.unlinkSync(media)
								fs.unlinkSync(ran)
							})
							.addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
							.toFormat('webp')
							.save(ran)
					} else if ((isMedia || isQuotedImage) && args[0] == 'nobg') {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await client.downloadAndSaveMediaMessage(encmedia)
						ranw = getRandom('.webp')
						ranp = getRandom('.png')
						reply(mess.wait)
						keyrmbg = 'Your-ApiKey'
						await removeBackgroundFromImageFile({path: media, apiKey: keyrmbg.result, size: 'auto', type: 'auto', ranp}).then(res => {
							fs.unlinkSync(media)
							let buffer = Buffer.from(res.base64img, 'base64')
							fs.writeFileSync(ranp, buffer, (err) => {
								if (err) return reply('Gagal, Terjadi kesalahan, silahkan coba beberapa saat lagi.')
							})
							exec(`ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${ranw}`, (err) => {
								fs.unlinkSync(ranp)
								if (err) return reply(mess.error.stick)
								buff = fs.readFileSync(ranw)
								client.sendMessage(from, buff, sticker, {quoted: mek})
							})
						})
					/*} else if ((isMedia || isQuotedImage) && colors.includes(args[0])) {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						const media = await client.downloadAndSaveMediaMessage(encmedia)
						ran = getRandom('.webp')
						await ffmpeg(`./${media}`)
							.on('start', function (cmd) {
								console.log('Started :', cmd)
							})
							.on('error', function (err) {
								fs.unlinkSync(media)
								console.log('Error :', err)
							})
							.on('end', function () {
								console.log('Finish')
								fs.unlinkSync(media)
								buff = fs.readFileSync(ran)
								client.sendMessage(from, buff, sticker, {quoted: mek})
								fs.unlinkSync(ran)
							})
							.addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=${args[0]}@0.0, split [a][b]; [a] palettegen=reserve_transparent=off; [b][p] paletteuse`])
							.toFormat('webp')
							.save(ran)*/
					} else {
						reply(`Kirim gambar dengan caption ${prefix}sticker atau tag gambar yang sudah dikirim`)
					}
					break
				case 'gtts':
					if (args.length < 1) return client.sendMessage(from, 'Kode bahasanya mana om?', text, {quoted: mek})
					const gtts = require('./lib/gtts')(args[0])
					if (args.length < 2) return client.sendMessage(from, 'Textnya mana om', text, {quoted: mek})
					dtt = body.slice(9)
					ranm = getRandom('.mp3')
					rano = getRandom('.ogg')
					dtt.length > 600
					? reply('Textnya kebanyakan om')
					: gtts.save(ranm, dtt, function() {
						exec(`ffmpeg -i ${ranm} -ar 48000 -vn -c:a libopus ${rano}`, (err) => {
							fs.unlinkSync(ranm)
							buff = fs.readFileSync(rano)
							if (err) return reply('Gagal om:(')
							client.sendMessage(from, buff, audio, {quoted: mek, ptt:true})
							fs.unlinkSync(rano)
						})
					})
					break
				case 'meme':
					meme = await kagApi.memes()
					buffer = await getBuffer(`https://imgur.com/${meme.hash}.jpg`)
					client.sendMessage(from, buffer, image, {quoted: mek, caption: '.......'})
					break
				case 'memeindo':
					memein = await kagApi.memeindo()
					buffer = await getBuffer(`https://imgur.com/${memein.hash}.jpg`)
					client.sendMessage(from, buffer, image, {quoted: mek, caption: '.......'})
					break
				case 'setprefix':
					if (args.length < 1) return
					if (!isOwner) return reply(mess.only.ownerB)
					prefix = args[0]
					reply(`Prefix berhasil di ubah menjadi : ${prefix}`)
					break
				case 'loli':
					loli.getSFWLoli(async (err, res) => {
						if (err) return reply('❌ *ERROR* ❌')
						buffer = await getBuffer(res.url)
						client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Ingat! Citai Lolimu'})
					})
					break
				case 'nsfwloli':
					if (!isNsfw) return reply('❌ *FALSE* ❌')
					loli.getNSFWLoli(async (err, res) => {
						if (err) return reply('❌ *ERROR* ❌')
						buffer = await getBuffer(res.url)
						client.sendMessage(from, buffer, image, {quoted: mek, caption: 'Jangan jadiin bahan buat comli om'})
					})
					break
				case 'hilih':
					if (args.length < 1) return reply('Teksnya mana um?')
					anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/hilih?teks=${body.slice(7)}`, {method: 'get'})
					reply(anu.result)
					break
				case 'yt2mp3':
					if (args.length < 1) return reply('Urlnya mana um?')
					if(!isUrl(args[0]) && !args[0].includes('youtu')) return reply(mess.error.Iv)
					anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/yta?url=${args[0]}&apiKey=${apiKey}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					teks = `*Title* : ${anu.title}\n*Filesize* : ${anu.filesize}`
					thumb = await getBuffer(anu.thumb)
					client.sendMessage(from, thumb, image, {quoted: mek, caption: teks})
					buffer = await getBuffer(anu.result)
					client.sendMessage(from, buffer, audio, {mimetype: 'audio/mp4', filename: `${anu.title}.mp3`, quoted: mek})
					break
				case 'ytsearch':
					if (args.length < 1) return reply('Yang mau di cari apaan? titit?')
					anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/ytsearch?q=${body.slice(10)}&apiKey=${apiKey}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					teks = '=================\n'
					for (let i of anu.result) {
						teks += `*Title* : ${i.title}\n*Id* : ${i.id}\n*Published* : ${i.publishTime}\n*Duration* : ${i.duration}\n*Views* : ${h2k(i.views)}\n=================\n`
					}
					reply(teks.trim())
					break
				case 'tiktok':
					if (args.length < 1) return reply('Urlnya mana um?')
					if (!isUrl(args[0]) && !args[0].includes('tiktok.com')) return reply(mess.error.Iv)
					reply(mess.wait)
					anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/tiktok?url=${args[0]}&apiKey=${apiKey}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buffer = await getBuffer(anu.result)
					client.sendMessage(from, buffer, video, {quoted: mek})
					break
				case 'tiktokstalk':
					try {
						if (args.length < 1) return client.sendMessage(from, 'Usernamenya mana um?', text, {quoted: mek})
						let { user, stats } = await tiktod.getUserProfileInfo(args[0])
						reply(mess.wait)
						teks = `*ID* : ${user.id}\n*Username* : ${user.uniqueId}\n*Nickname* : ${user.nickname}\n*Followers* : ${stats.followerCount}\n*Followings* : ${stats.followingCount}\n*Posts* : ${stats.videoCount}\n*Luv* : ${stats.heart}\n`
						buffer = await getBuffer(user.avatarLarger)
						client.sendMessage(from, buffer, image, {quoted: mek, caption: teks})
					} catch (e) {
						console.log(`Error :`, color(e,'red'))
						reply('Kemungkinan username tidak valid')
					}
					break
				case 'nulis':
				case 'tulis':
					if (args.length < 1) return reply('Yang mau di tulis apaan?')
					teks = body.slice(7)
					reply(mess.wait)
					anu = await fetchJson(`https://mhankbarbars.herokuapp.com/nulis?text=${teks}&apiKey=${apiKey}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek, caption: mess.success})
					break
				case 'url2img':
					tipelist = ['desktop','tablet','mobile']
					if (args.length < 1) return reply('Tipenya apa um?')
					if (!tipelist.includes(args[0])) return reply('Tipe desktop|tablet|mobile')
					if (args.length < 2) return reply('Urlnya mana um?')
					if (!isUrl(args[1])) return reply(mess.error.Iv)
					reply(mess.wait)
					anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/url2image?tipe=${args[0]}&url=${args[1]}&apiKey=${apiKey}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					buff = await getBuffer(anu.result)
					client.sendMessage(from, buff, image, {quoted: mek})
					break
				case 'tstiker':
				case 'tsticker':
					if (args.length < 1) return reply('Textnya mana um?')
					ranp = getRandom('.png')
					rano = getRandom('.webp')
					teks = body.slice(9).trim()
					anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/text2image?text=${teks}&apiKey=${apiKey}`, {method: 'get'})
					if (anu.error) return reply(anu.error)
					exec(`wget ${anu.result} -O ${ranp} && ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${rano}`, (err) => {
						fs.unlinkSync(ranp)
						if (err) return reply(mess.error.stick)
						buffer = fs.readFileSync(rano)
						client.sendMessage(from, buffer, sticker, {quoted: mek})
						fs.unlinkSync(rano)
					})
					break
				case 'tagall':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					members_id = []
					teks = (args.length > 1) ? body.slice(8).trim() : ''
					teks += '\n\n'
					for (let mem of groupMembers) {
						teks += `*#* @${mem.jid.split('@')[0]}\n`
						members_id.push(mem.jid)
					}
					mentions(teks, members_id, true)
					break
				case 'clearall':
					if (!isOwner) return reply('Kamu siapa?')
					anu = await client.chats.all()
					client.setMaxListeners(25)
					for (let _ of anu) {
						client.deleteChat(_.jid)
					}
					reply('Sukses delete all chat :)')
					break
				case 'bc':
					if (!isOwner) return reply('Kamu siapa?')
					if (args.length < 1) return reply('.......')
					anu = await client.chats.all()
					if (isMedia && !mek.message.videoMessage || isQuotedImage) {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						buff = await client.downloadMediaMessage(encmedia)
						for (let _ of anu) {
							client.sendMessage(_.jid, buff, image, {caption: `[ MR.057 Broadcast ]\n\n${body.slice(4)}`})
						}
						reply('Suksess broadcast')
					} else {
						for (let _ of anu) {
							sendMess(_.jid, `[ Ini Broadcast ]\n\n${body.slice(4)}`)
						}
						reply('Suksess broadcast')
					}
					break
				case 'add':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (!isBotGroupAdmins) return reply(mess.only.Badmin)
					if (args.length < 1) return reply('Yang mau di add jin ya?')
					if (args[0].startsWith('08')) return reply('Gunakan kode negara mas')
					try {
						num = `${args[0].replace(/ /g, '')}@s.whatsapp.net`
						client.groupAdd(from, [num])
					} catch (e) {
						console.log('Error :', e)
						reply('Gagal menambahkan target, mungkin karena di private')
					}
					break
				case 'kick':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (!isBotGroupAdmins) return reply(mess.only.Badmin)
					if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return reply('Tag target yang ingin di tendang!')
					mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
					if (mentioned.length > 1) {
						teks = 'Perintah di terima, mengeluarkan :\n'
						for (let _ of mentioned) {
							teks += `@${_.split('@')[0]}\n`
						}
						mentions(teks, mentioned, true)
						client.groupRemove(from, mentioned)
					} else {
						mentions(`Perintah di terima, mengeluarkan : @${mentioned[0].split('@')[0]}`, mentioned, true)
						client.groupRemove(from, mentioned)
					}
					break
				case 'listadmins':
					if (!isGroup) return reply(mess.only.group)
					teks = `List admin of group *${groupMetadata.subject}*\nTotal : ${groupAdmins.length}\n\n`
					no = 0
					for (let admon of groupAdmins) {
						no += 1
						teks += `[${no.toString()}] @${admon.split('@')[0]}\n`
					}
					mentions(teks, groupAdmins, true)
					break
				case 'toimg':
					if (!isQuotedSticker) return reply('❌ reply stickernya um ❌')
					reply(mess.wait)
					encmedia = JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo
					media = await client.downloadAndSaveMediaMessage(encmedia)
					ran = getRandom('.png')
					exec(`ffmpeg -i ${media} ${ran}`, (err) => {
						fs.unlinkSync(media)
						if (err) return reply('❌ Gagal, pada saat mengkonversi sticker ke gambar ❌')
						buffer = fs.readFileSync(ran)
						client.sendMessage(from, buffer, image, {quoted: mek, caption: '>//<'})
						fs.unlinkSync(ran)
					})
					break
				case 'simi':
					if (args.length < 1) return reply('Textnya mana um?')
					teks = body.slice(5)
					anu = await simih(teks) //fetchJson(`https://mhankbarbars.herokuapp.com/api/samisami?text=${teks}`, {method: 'get'})
					//if (anu.error) return reply('Simi ga tau kak')
					reply(anu)
					break
				case 'simih':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (args.length < 1) return reply('Hmmmm')
					if (Number(args[0]) === 1) {
						if (isSimi) return reply('Mode simi sudah aktif')
						samih.push(from)
						fs.writeFileSync('./src/simi.json', JSON.stringify(samih))
						reply('Sukses mengaktifkan mode simi di group ini ✔️')
					} else if (Number(args[0]) === 0) {
						samih.splice(from, 1)
						fs.writeFileSync('./src/simi.json', JSON.stringify(samih))
						reply('Sukes menonaktifkan mode simi di group ini ✔️')
					} else {
						reply('1 untuk mengaktifkan, 0 untuk menonaktifkan')
					}
					break
				case 'welcome':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (args.length < 1) return reply('Hmmmm')
					if (Number(args[0]) === 1) {
						if (isWelkom) return reply('Udah aktif um')
						welkom.push(from)
						fs.writeFileSync('./src/welkom.json', JSON.stringify(welkom))
						reply('Sukses mengaktifkan fitur welcome di group ini ✔️')
					} else if (Number(args[0]) === 0) {
						welkom.splice(from, 1)
						fs.writeFileSync('./src/welkom.json', JSON.stringify(welkom))
						reply('Sukses menonaktifkan fitur welcome di group ini ✔️')
					} else {
						reply('1 untuk mengaktifkan, 0 untuk menonaktifkan')
					}
				case 'clone':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (args.length < 1) return reply('Tag target yang ingin di clone')
					if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return reply('Tag cvk')
					mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid[0]
					let { jid, id, notify } = groupMembers.find(x => x.jid === mentioned)
					try {
						pp = await client.getProfilePicture(id)
						buffer = await getBuffer(pp)
						client.updateProfilePicture(botNumber, buffer)
						mentions(`Foto profile Berhasil di perbarui menggunakan foto profile @${id.split('@')[0]}`, [jid], true)
					} catch (e) {
						reply('Gagal om')
					}
					break
				case 'wait':
					if ((isMedia && !mek.message.videoMessage || isQuotedImage) && args.length == 0) {
						reply(mess.wait)
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
						media = await client.downloadMediaMessage(encmedia)
						await wait(media).then(res => {
							client.sendMessage(from, res.video, video, {quoted: mek, caption: res.teks.trim()})
						}).catch(err => {
							reply(err)
						})
					} else {
						reply('Foto aja mas')
					}
					break
				default:
					if (isGroup && isSimi && budy != undefined) {
						console.log(budy)
						muehe = await simih(budy)
						console.log(muehe)
						reply(muehe)
					} else {
						console.log(color('[ERROR]','red'), 'Unregistered Command from', color(sender.split('@')[0]))
					}
                           }
		} catch (e) {
			console.log('Error : %s', color(e, 'red'))
		}
	})
}

// LIST CVPULSA
client.on('message', msg => {
	if (msg.body == 'cvpulsa') {
		msg.reply(`
  ╔══✪〘 MENU CV PULSA 〙✪══
  ║
  ╠➥ *RATE CV PULSA*
  ╠➥ *MR.057*
  ╠➥ CODDER BOT : @irfnadi_
  ╠➥ wa.me/6281348421097
  ║
  ╠══✪〘 CV PULSA 〙✪══
  ║Untuk layanan convert pulsa
  ║saat ini hanya melayani dari 
  ║pulsa Telkomsel.
  ║rate saat ini 700
  ║Untuk menghitungnya:
  ║pulsa X 700 = saldo yg di dapat
  ║Contoh:
  ║100 X 700 = 70.000
  ║Jadi jika ingin mengconvert
  ║pulsa 100k berarti 
  ║mendapatkan saldo 
  ║sebesar 70k
  ║
  ║jika sudah paham dan ingin 
  ║melanjutkan, silahkan transfer 
  ║pulsanya ke nomor 
  ║081348421097
  ║Jangan lupa kirim bukti 
  ║transfernya 
  ║ya kak. ~Mr.057
  ║
  ╚═〘 *MR.057 STORE* 〙`);
	}
  });
  //LIST PUBG
  
  client.on('message', msg => {
	if (msg.body == 'listpubg') {
		msg.reply(`
  ╔══✪〘 MENU UC PUBG 〙✪══
  ║
  ╠➥ *UC PUBG REG INDO*
  ╠➥ *MR.057*
  ╠➥ CODDER BOT : @irfnadi_
  ╠➥ wa.me/6281348421097
  ║
  ╠══✪〘 UC PUBG INDO A 〙✪══
  ║ 
  ╠➥ *FAST RESPON*
  ╠➥ 50 uc= 10.000
  ╠➥ 125 uc = 26.500
  ╠➥ 100 uc = 30.000
  ╠➥ 150 uc = 31.500
  ╠➥ 250 uc = 49.000
  ╠➥ 500 uc = 98.000
  ╠➥ 700 uc = 140.000
  ╠➥ 1250 uc = 253.000
  ╠➥ 2500 uc = 505.000
  ║
  ╠══✪〘 UC PUBG INDO B 〙✪══
  ║
  ╠➥ *LOW RESPON*
  ╠➥50 uc = 9.000
  ╠➥53 uc = 9.500
  ╠➥100 uc = 20.000
  ╠➥150 uc = 27.000
  ╠➥156 uc = 28.000
  ╠➥250 uc = 44.500
  ╠➥263 uc = 45.500
  ╠➥500 uc = 90.000
  ╠➥525 uc = 91.000
  ╠➥600 uc = 105.000
  ╠➥700 uc = 125.000
  ╠➥800 uc = 140.000
  ╠➥1000 uc = 172.000
  ╠➥1250 uc = 222.000
  ╠➥1350 uc = 235.000
  ╠➥1375 uc = 236.000
  ╠➥1500 uc = 262.000
  ╠➥1800 uc = 305.000
  ╠➥2000 uc = 340.000
  ║
  ╚═〘 *MR.057 STORE* 〙`);
	}
  });
  //LIST FF
  client.on('message', msg => {
	if (msg.body == 'listff') {
		msg.reply(`
  ╔══✪〘 MENU DM FF 〙✪══
  ║
  ╠➥ *DIAMOND FF*
  ╠➥ *MR.057*
  ╠➥ CODDER BOT : @irfnadi_
  ╠➥ wa.me/6281348421097
  ║
  ╠══✪〘 DIAMOND FF 〙✪══
  ║ 
  ╠➥ 5 Dm = 850
  ╠➥ 20 Dm = 2.770
  ╠➥ 50 Dm = 6.648
  ╠➥ 70 Dm = 9.141
  ╠➥ 100 Dm = 13.296
  ╠➥ 140 Dm = 18.282
  ╠➥ 150 Dm = 19.944
  ╠➥ 210 Dm = 27.423
  ╠➥ 355 Dm = 45.705
  ╠➥ 425 Dm = 54.846
  ╠➥ 500 Dm = 64.818
  ╠➥ 720 Dm = 91.410
  ╠➥ 860 Dm = 109.692
  ╠➥ 1000 Dm = 127.974
  ╠➥ 1075 Dm = 137.115
  ╠➥ 1440 Dm = 182.820
  ╠➥ 2000 Dm = 249.300
  ╠➥ 2720 Dm = 340.710
  ╠➥ 4000 Dm = 498.600
  ║
  ╠➥M.M = 27.700
  ╠➥M.B = 110.800
  ║
  ╚═〘 *MR.057 STORE* 〙`);
	}
  });
  // LIST MENU
  client.on('message', msg => {
	if (msg.body == 'menu') {
		msg.reply(`
  ╔══✪〘 INFORMATION 〙✪══  
  ║
  ╠➥ MENU LAYANAN MR.057
  ╠➥ Codder Bot : irfnadi_
  ╠➥ wa.me/6281348421097
  ║
  ╠══✪〘 MENU MR.057 STORE 〙✪══
  ║
  ╠➥ *JASA REKBER/PULBER*
  ║
  ╠═══✪〘MENU COMMAND〙✪═
  ║
  ╠➥ *CONVERT PULSA : cvpulsa*
  ╠➥ *DM FREE FIRE  : listff*
  ╠➥ *DM ML         : listml*
  ╠➥ *UC PUBG       : listpubg*
  ╠➥ *PULSA TF TSEL : pulsatf*
  ╠➥ *PULSA ALL OPR : allpulsa*
  ╠➥ *QUOTA         : paketdata*
  ╠➥ *GARENA SHELL  : listshell*
  ╠➥ *CV EMONEY     : cvemoney*
  ╠➥ *PULSA LISTRIK : listrik*
  ╠➥ *CV PAYPAL     : cvpaypal* 
  ║
  ╚═〘 MR.057 STORE 〙`);
	}
  });
  //LIST PULSA TF
  client.on('message', msg => {
	if (msg.body == 'pulsatf') {
		msg.reply(`
  ╔══✪〘 MENU PULSA TF 〙✪══
  ║
  ╠➥ *PULSA TF TELKOM*
  ╠➥ *MR.057*
  ╠➥ CODDER BOT : @irfnadi_
  ╠➥ wa.me/6281348421097
  ║
  ╠══✪〘 PULSA TF TSEL 〙✪══
  ║ 
  ╠➥ 5.000 Harga= 6.000
  ╠➥ 10.000 harga= 11.000
  ╠➥ 15.000 harga= 15.000
  ╠➥ 20.000 harga= 19.000
  ╠➥ 25.000 harga= 23.500
  ╠➥ 30.000 harga= 28.000
  ╠➥ 35.000 harga =33.000
  ╠➥ 40.000 harga =36.500
  ╠➥ 45.000 harga= 42.000
  ╠➥ 50.000 harga= 44.000
  ╠➥ 55.000 harga= 50.000
  ╠➥ 60.000 harga= 53.000
  ╠➥ 65.000 harga= 58.000
  ╠➥ 70.000 harga= 62.000
  ╠➥ 75.000 harga= 66.000
  ╠➥ 80.000 harga= 70.500
  ╠➥ 85.000 harga= 75.000
  ╠➥ 90.000 harga= 80.000
  ╠➥ 95.000 harga= 83.500
  ╠➥ 100.000 harga= 87.000
  ╠➥ 110.000 harga= 97.000
  ╠➥ 120.000 harga= 105.000
  ╠➥ 130.000 harga= 115.000
  ╠➥ 140.000 harga= 122.000
  ╠➥ 150.000 harga= 133.000
  ╠➥ 200.000 harga= 172.000
  ╠➥ 250.000 harga= 225.000
  ╠➥ 300.000 harga= 262.000
  ╠➥ 400.000 harga= 350.000
  ╠➥ 500.000 harga= 435.000
  ║
  ╚═〘 *MR.057 STORE* 〙`);
	}
  });
  //list PULSA ALL OPERATOR
  client.on('message', msg => {
	if (msg.body == 'allpulsa') {
		msg.reply(`
  🔰 --[ *PULSA ALL OPERATOR* ]-- 🔰
		  
  Hi,👋️
  INI MENU PULSA ALL OPERATOR ! ✨
		
  ⚠️ *BOT INI HANYA MENAMPILKAN LIST!*
  ⚠️ *JANGAN TRANSFER APAPUN KE NOMOR BOT!*
		
  *♻  : ISI ULANG ALL OPERATOR* 
	   
  Telkomsel M-Kios
  Indosat isi ulang
  Axis isi ulang
  Tri isi ulang
  Smartfrend isi ulang
  Xl isi ulang
  Byu isi ulang
  
  ⚠️ *PAYMENT* ⚠️
  *- SCAN BARCODE = PROFIL GRUB*
  *- DANA = 082351466247*
  *- OVO = 082351466247*
  *- GOPAY = 081348421097*
  *- LINKAJA = 081348421097*
  *- BRIVA = 88810082351466247*
		  
  🔰 --[ *MR.057 BOT* ]-- 🔰`);
	}
  });
  //LIST PAKET DATA / QUOTA
  client.on('message', msg => {
	if (msg.body == 'paketdata') {
		msg.reply(`
  ╔══✪〘 MENU QUOTA INTERNET 〙✪══
  ║
  ╠➥ *QUOTA INTERNET*
  ╠➥ *MR.057*
  ╠➥ CODDER BOT : @irfnadi_
  ╠➥ wa.me/6281348421097
  ║
  ╠══✪〘 QUOTA INTERNET 〙✪══
  ║ 
  ╠➥ Quota telkomsel = qtsel
  ╠➥ Quota indosat = qindo
  ╠➥ Quota axis = qaxis
  ╠➥ Quota tri = qtri
  ╠➥ Quota smartfrend = qsmart
  ╠➥ Quota xl = qxl
  ║
  ╚═〘 *MR.057 STORE* 〙`);
	}
  });
  //QTELKOMSEL
  client.on('message', msg => {
	if (msg.body == 'qtsel') {
		msg.reply(`
  🔰 --[ *MENU QUOTA TELKOMSEL* ]-- 🔰
		  
  Hi,👋️ 
  INI MENU QUOTA TELKOMSEL ! ✨
		
  ⚠️ *BOT INI HANYA MENAMPILKAN LIST!*
  ⚠️ *JANGAN TRANSFER APAPUN KE NOMOR BOT!*
		
  *♻  : LIST QUOTA TELKOMSEL* 
	   
  Telkomsel Data Flash = t1
  Telkomsel Semua Jaringan = t2
  Telkomsel Data Mini = t3 
  Telkomsel GamesMax = t4
  Telkomsel Data Bulk = t5 
  Telkomsel Paket Combo = t6 
  Gift Quota tsel super murah = t7
  
  ⚠️ *PAYMENT* ⚠️
  *- SCAN BARCODE = PROFIL GRUB*
  *- DANA = 082351466247*
  *- OVO = 082351466247*
  *- GOPAY = 081348421097*
  *- LINKAJA = 081348421097*
  *- BRIVA = 88810082351466247*
		  
  🔰 --[ *MR.057 BOT* ]-- 🔰`);
	}
  });
  //QINDOSAT
  client.on('message', msg => {
	if (msg.body == 'qindo') {
		msg.reply(`
  🔰 --[ *MENU QUOTA INDOSAT* ]-- 🔰
		  
  Hi,👋️ 
  INI MENU QUOTA INDOSAT ! ✨
		
  ⚠️ *BOT INI HANYA MENAMPILKAN LIST!*
  ⚠️ *JANGAN TRANSFER APAPUN KE NOMOR BOT!*
		
  *♻  : LIST QUOTA INDOSAT* 
	   
  Gift data = isat1
  Indosat Data = isat2
  Indosat Yellow = isat3
  Indosat Internet Unlimited = isat4
  Indosat Freedom Internet = isat5
  ISAT FREEDOM COMBO = isat6
  Indosat Freedom Combo = isat7
  ISAT FREEDOM UNLIMITED = isat8
  ISAT FREEDOM INTERNET = isat9
  Indosat Paket Ekstra = isat10
  Indosat Freedom = isat11
  
  ⚠️ *PAYMENT* ⚠️
  *- SCAN BARCODE = PROFIL GRUB*
  *- DANA = 082351466247*
  *- OVO = 082351466247*
  *- GOPAY = 081348421097*
  *- LINKAJA = 081348421097*
  *- BRIVA = 88810082351466247*
		  
  🔰 --[ *MR.057 BOT* ]-- 🔰`);
	}
  });
  //QAXIS
  client.on('message', msg => {
	if (msg.body == 'qaxis') {
		msg.reply(`
  🔰 --[ *MENU QUOTA AXIS* ]-- 🔰
		  
  Hi,👋️ 
  INI MENU QUOTA AXIS ! ✨
		
  ⚠️ *BOT INI HANYA MENAMPILKAN LIST!*
  ⚠️ *JANGAN TRANSFER APAPUN KE NOMOR BOT!*
		
  *♻  : LIST QUOTA AXIS* 
	   
  Axis bronet = axis1
  Axis Owsem = axis2
  
  ⚠️ *PAYMENT* ⚠️
  *- SCAN BARCODE = PROFIL GRUB*
  *- DANA = 082351466247*
  *- OVO = 082351466247*
  *- GOPAY = 081348421097*
  *- LINKAJA = 081348421097*
  *- BRIVA = 88810082351466247*
		  
  🔰 --[ *MR.057 BOT* ]-- 🔰`);
	}
  });
  //QTRI
  client.on('message', msg => {
	if (msg.body == 'qtri') {
		msg.reply(`
  🔰 --[ *MENU QUOTA TRI* ]-- 🔰
		  
  Hi,👋️ 
  INI MENU QUOTA TRI ! ✨
		
  ⚠️ *BOT INI HANYA MENAMPILKAN LIST!*
  ⚠️ *JANGAN TRANSFER APAPUN KE NOMOR BOT!*
		
  *♻  : LIST QUOTA TRI* 
	   
  Tri data = tri1
  Three Mix Small = tri2
  Three Mini = tri3
  Three Always On = tri4
  Three Mix Combo = tri5
  Three Mix Super = tri6
  Three AlwaysOn Unlimited = tri7
  
  ⚠️ *PAYMENT* ⚠️
  *- SCAN BARCODE = PROFIL GRUB*
  *- DANA = 082351466247*
  *- OVO = 082351466247*
  *- GOPAY = 081348421097*
  *- LINKAJA = 081348421097*
  *- BRIVA = 88810082351466247*
		  
  🔰 --[ *MR.057 BOT* ]-- 🔰`);
	}
  });
  //QSMART
  client.on('message', msg => {
	if (msg.body == 'qsmart') {
		msg.reply(`
  🔰 --[ *MENU QUOTA SMARTFREN* ]-- 🔰
		  
  Hi,👋️ 
  INI MENU QUOTA SMARTFREN ! ✨
		
  ⚠️ *BOT INI HANYA MENAMPILKAN LIST!*
  ⚠️ *JANGAN TRANSFER APAPUN KE NOMOR BOT!*
		
  *♻  : LIST QUOTA SMARTFREN* 
	   
  Smart Internet
  Smart Data
  
  ⚠️ *PAYMENT* ⚠️
  *- SCAN BARCODE = PROFIL GRUB*
  *- DANA = 082351466247*
  *- OVO = 082351466247*
  *- GOPAY = 081348421097*
  *- LINKAJA = 081348421097*
  *- BRIVA = 88810082351466247*
		  
  🔰 --[ *MR.057 BOT* ]-- 🔰`);
	}
  });
  //QXL
  client.on('message', msg => {
	if (msg.body == 'qxl') {
		msg.reply(`
  🔰 --[ *MENU QUOTA XL* ]-- 🔰
		  
  Hi,👋️ 
  INI MENU QUOTA XL ! ✨
		
  ⚠️ *BOT INI HANYA MENAMPILKAN LIST!*
  ⚠️ *JANGAN TRANSFER APAPUN KE NOMOR BOT!*
		
  *♻  : LIST QUOTA XL* 
	   
  XL Combo LITE = xl1
  XL Hotrod = xl2
  XL Xtra Combo = xl3
  XL Xtra Combo VIP = xl4
  
  ⚠️ *PAYMENT* ⚠️
  *- SCAN BARCODE = PROFIL GRUB*
  *- DANA = 082351466247*
  *- OVO = 082351466247*
  *- GOPAY = 081348421097*
  *- LINKAJA = 081348421097*
  *- BRIVA = 88810082351466247*
		  
  🔰 --[ *MR.057 BOT* ]-- 🔰`);
	}
  });
  // list GSHELL
  client.on('message', msg => {
	if (msg.body == 'listshell') {
		msg.reply(`
  ╔══✪〘 MENU GARENA SHELL 〙✪══
  ║
  ╠➥ *GARENA SHELL*
  ╠➥ *MR.057*
  ╠➥ CODDER BOT : @irfnadi_
  ╠➥ wa.me/6281348421097
  ║
  ╠══✪〘 GARENA SHELL 〙✪══
  ║ 
  ╠➥ 33 gs = 9.500
  ╠➥ 66 gs = 19.000
  ╠➥ 165 gs = 46.000
  ╠➥ 330 gs = 91.500
  ║
  ╠➥ 3.300 gs = 911.000
  ║
  ╚═〘 *MR.057 STORE* 〙`);
	}
  });
  // LIST DIAMOND ML
  client.on('message', msg => {
	if (msg.body == 'listml') {
		msg.reply(`
  ╔══✪〘 MENU DM ML 〙✪══
  ║
  ╠➥ *DIAMOND ML*
  ╠➥ *MR.057*
  ╠➥ CODDER BOT : @irfnadi_
  ╠➥ wa.me/6281348421097
  ║
  ╠══✪〘 DIAMOND ML 〙✪══
  ║ 
  ╠➥ 3💎 = 1.800
  ╠➥ 12💎 = 3.800
  ╠➥ 15💎 = kosong
  ╠➥ 28💎 = 8.000
  ╠➥ 30💎 = kosong
  ╠➥ 33💎 = kosong
  ╠➥ 36💎 = 9.900
  ╠➥ 45💎 = kosong
  ╠➥ 59💎 = 15.700
  ╠➥ 60💎 = kosong
  ╠➥ 74💎 = 19.700
  ╠➥ 85💎 = 22.700
  ╠➥ 170💎 = 45.000
  ╠➥ 167💎 = kosong
  ╠➥ 185💎 = 49.900
  ╠➥ 222💎 = 59.900
  ╠➥ 296💎 = 80.000
  ╠➥ 370💎 = 100.000
  ╠➥ 568💎 = 146.000
  ╠➥ 702💎 = kosong
  ╠➥ 875💎 = 223.000
  ╠➥ 1159💎 = 293.000
  ╠➥ 1830💎 = 475.000
  ╠➥ 2010 💎 = 486.000
  ╠➥ 3638💎 = kosong
  ╠➥ 4830💎 = 1.167.000
  ╠➥ 6050💎 = 1.487.000
  ║
  ╚═〘 *MR.057 STORE* 〙`);
	}
  });
  // MENU PE PA PE PA
  client.on('message', msg => {
	if (msg.body == 'p') {
		msg.reply(`
		Pe pa pe pa
  
		Ya ada apa bisa di bantu kalau bingung ketik : *menu* ya say.`);
	}
  });
  // PE PA PE PA 2
  client.on('message', msg => {
	if (msg.body == 'P') {
		msg.reply(`
		Pe pa pe pa
  
		Ya ada apa bisa di bantu kalau bingung ketik : *menu* ya say.`);
	}
  });
  // asaalamualaikum
  client.on('message', msg => {
	if (msg.body == 'assalamualaikum') {
		msg.reply(`
		waalaikumsalam
  
		Ya ada apa bisa di bantu kalau bingung ketik : *menu* ya say.`);
	}
  });
  // Assalamualaikum
  client.on('message', msg => {
	if (msg.body == 'Assalamualaikum') {
		msg.reply(`
		Waalaikumsalam
  
		Ya ada apa bisa di bantu kalau bingung ketik : *menu* ya say.`);
	}
  });
  
starts()
