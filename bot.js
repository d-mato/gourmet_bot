const request = require('request')
const cheerio = require('cheerio')
const IncomingWebhook = require('@slack/client').IncomingWebhook

module.exports = () => {
  const url = 'https://tabelog.com/tokyo/rstLst/?Srt=D&SrtT=rt&sort_mode=1&ChkNewOpen=1'
  const webhook_url = process.env.WEBHOOK_URL

  request(url, (err, res, body) => {
    const $ = cheerio.load(body)
    const topics = $('li.list-rst').map((i, el) => {
      const a = $('a.list-rst__comment-text.cpy-comment-text', el).first()
      return {
        url: a.attr('href'),
        restaurant: $('a.list-rst__rst-name-target.cpy-rst-name', el).text().trim(),
        title: a.text().trim(),
        star: $('span.tb-rating__val.tb-rating__val--strong.list-rst__rating-val', el).first().text().trim(),
        meta: $('span.list-rst__area-genre.cpy-area-genre', el).first().text().trim(),
        price: $('li.tb-rating.tb-rating--sm.list-rst__budget-item', el).map((i, el) => $(el).text().trim() ).get().join(' ')
      }
    }).get()
    console.log(topics)

    const text = "*週間食べログ人気ランキング*\n\n" + topics.map((topic, i) => {
      return `[${i+1}] ${topic.restaurant} ${topic.meta} :star: ${topic.star} :moneybag: ${topic.price}\n<${topic.url}|${topic.title}>`
    }).join("\n\n")

    const webhook = new IncomingWebhook(webhook_url)
    webhook.send(text)
  })
}
