const handler = require('exchange');
const utils = require("utils")

describe('Binance futures test.', function () {
    this.timeout(1000 * 1000)
    before(() => {
        let settings = {
            "position": {
                "BTCUSDT": 0,
                "ETHUSDT": 0,
                "BNBUSDT": 0,
            },
            "asset": {
                "BTCUSDT": {
                    "minimumOrderAmount": 0.001,
                    "onetimeOrderAmount": 0.001,
                    "rateOverBalance": 1,
                    "timeSleep": 1000,
                    "stopLossPercent": 5
                },
                "ETHUSDT": {
                    "minimumOrderAmount": 0.1,
                    "onetimeOrderAmount": 1,
                    "rateOverBalance": 0.6,
                    "timeSleep": 500,
                    "stopLossPercent": 5
                }
            },
            "dateTime": "2020-11-06 04:33:12",
            "title": "st2021",
            "exchange": "binance-futures",
            "user": "songaal",
            "passcode": "!23456"
        }
        // handler.updateSettings(settings)
        handler.settings = settings
        handler.init(process.env['APIKEY'], process.env['APISECRET'])
    })

    it('show settings ', async function () {
        console.log(JSON.stringify(global.settings, null, 2))
    })

    it('get account', async function () {
        const account = await handler.account()
        console.log(`account: `, account)
    })

    it('user asset', async function () {
        console.log(await handler.getUserAsset('USDT'))
    })

    it('futures open long / close long', async function () {
        const ret = await handler.order('BTCUSDT', handler.C.BUY, 0.001)
        console.log(`ret: `, ret)
    });

    it('futures open short / close short', async function () {
        const ret = await handler.order('BTCUSDT', handler.C.SELL, 0.026)
        console.log(`ret: `, ret)
    });

    it('futures BTC LONG open and close', async function () {
        try {
            const investRate = 0.1
            const symbol = 'BTCUSDT'
            let amount = await handler.getMyNetValueOfBTC() * investRate;
            let ordered = await handler.order(symbol, handler.C.BUY, amount)
            console.log(`OPEN 롱포지션. ${symbol} ${utils.floor4(ordered)} (${utils.floor4(amount)})`)
            await utils.sleep(2000)
            amount = ordered
            ordered = await handler.order(symbol, handler.C.SELL, ordered)
            console.log(`CLOSE 롱포지션. ${symbol} ${utils.floor4(ordered)} (${utils.floor4(amount)})`)
        } catch (e) {
            console.error(e)
        }
    });

    it('open long and close for BTC', async function () {
        try {
            const investRate = 0.1
            const symbol = 'BTCUSDT'
            let opened = await handler.openLong(symbol, investRate)
            //잠시쉬고
            await utils.sleep(10000)
            let closed = await handler.closeLong(symbol, opened)
        } catch (e) {
            console.error(e)
        }
    });

    it('open short and close for BTC', async function () {
        try {
            const investRate = 0.1
            const symbol = 'BTCUSDT'
            let opened = await handler.openShort(symbol, investRate)
            //잠시쉬고
            await utils.sleep(10000)
            let closed = await handler.closeShort(symbol, opened)
        } catch (e) {
            console.error(e)
        }
    });

    it('ETH open long and close', async function () {
        try {
            const investRate = 0.01
            const symbol = 'ETHUSDT'
            let opened = await handler.openLong(symbol, investRate)
            //잠시쉬고
            await utils.sleep(10000)
            let closed = await handler.closeLong(symbol, opened)
        } catch (e) {
            console.error(e)
        }
    });

    it('ETH open long PYRAMIDING and close', async function () {
        try {
            const investRate = 0.1
            const symbol = 'ETHUSDT'
            let opened = await handler.openLong(symbol, investRate)
            console.log(`opened: ${opened}`)
            //잠시쉬고
            await utils.sleep(10000)
            let opened2 = await handler.openLong(symbol, investRate)
            console.log(`opened2: ${opened2}`)
            //잠시쉬고
            await utils.sleep(10000)
            let closed = await handler.closeLong(symbol, opened + opened2)
            console.log(`closed: ${closed}`)
        } catch (e) {
            console.error(e)
        }
    });



});