const express = require('express')
const request = require('request')
const cheerio = require('cheerio')

const scraperRouter = express.Router()

const pizzasLogic = new(require('../pizzas/PizzasLogic'))

scraperRouter.route('/')
    .get((req, res) => {
        // const pizzas = pizzasLogic.listAll()
        // try{
        //     res.json({
        //                 status: 'OK',
        //                 message: 'Pizzas listed successfully',
        //                 data:  pizzas               
        //             })
        // } catch (e) {
        //     console.error(e.message)
        // }
        const url = 'https://www.dominospizza.es/carta-de-pizzas'
        try {
            var options = {
                url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
                }
            };
            request(options, function (error, response, html) {
                if (error) throw error

                const $ = cheerio.load(html)

                //let names = ingredients = images = []
                const pizzasRaw = []
                const pizzasFiltered = []

                $('#CartaPizzas').filter(function () {
                    $(this).find('.PizzaContent').each(function (index, item) {
                        $(this).find('.pizza-detail').filter(function (index, item) {
                            pizzasRaw.push(item.children[1].children[0].data)
                            pizzasRaw.push(item.children[3].children[0].data)
                        })
                        $(this).find('img').filter(function (index, item) {
                            if (pizzasRaw.length !== 0)
                                pizzasRaw.push('http:' + item.attribs.src)
                        })
                    })
                })
                console.log(pizzasRaw)
                for (let i = 0; i < pizzasRaw.length; i += 3) {
                    if (pizzasRaw[i].toLowerCase() !== "margarita" && pizzasRaw[i].toLowerCase() !== "elige por mitades" && pizzasRaw[i].toLowerCase() !== "campiña pan" && pizzasRaw[i].toLowerCase() !== "patanegra pan" && pizzasRaw[i].toLowerCase() !== "gluten free") {
                        pizzasFiltered.push({
                            name: pizzasRaw[i],
                            ingredients: pizzasRaw[i + 1],
                            image: pizzasRaw[i + 2]
                        })
                    }
                }
                res.json({
                    html: html,
                    status: 'OK',
                    message: 'Pizzas scrapped successfully',
                    data: pizzasFiltered
                })

            })
        } catch (e) {
            console.error(e.message)
        }
    })

module.exports = scraperRouter