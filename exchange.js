/**
 * 요청 주문을 설정을 보고 거래소별 handler 로 호출해준다.
 * */
const utils = require("utils");
const ccxt = require("ccxt")
const NO_POSITION_SIZE = 0
const NO_POSITION_PYRAMIDING = 0

const getExchange = (botInfo) => {
    const exchangeId = botInfo['exchangeId']
    return new ccxt[exchangeId] ({
        'apiKey': botInfo['apiKey'],
        'secret': botInfo['secret'],
        'timeout': 30000,
        'enableRateLimit': true,
    })
}

module.exports = {

    /**
     * 현물 - 매수
     * */
    buy: async function (exchangeId, symbol, setting) {

        let symbol2 = 'BTC/USDT' //not BTCUSDT (tv)
        let type = 'market' //market, limit
        let side = 'sell' //buy, sell


        const exchange = getExchange(exchangeId)
        let balance = await exchange.fetchBalance({'coin': coin})
        let total = balance[coin]['total']
        console.log(`balance >> `, balance)
        console.log(`balance1 >> `, total, coin)
        try {
            const response = await exchange.createOrder (symbol, type, side, amount,price, {
                'reduce_only': true,
                'time_in_force': 'GoodTillCancel',
                'close_on_trigger': false
            });
            console.log (response);
            console.log ('Succeeded');

        } catch (e) {

            console.log (exchange.iso8601 (Date.now ()), e.constructor.name, e.message)
            console.log ('Failed');

        }
    },
    /**
     * 현물 - 매도
     * */
    sell: async function (user, title, symbol, setting) {


    },

    /**
     * 선물 - 롱 포지션
     * */
    longPosition: async function (user, title, symbol, setting) {
        // 거래소별로 분기한다.
        try {
            if (!(symbol in setting.asset)) {
                throw new Error(`${symbol} 자산설정이 없어서 주문을 진행할수 없습니다.`)
            }
            const asset = setting.asset[symbol]
            /*
            "asset": {
                "BTCUSDT": {
                   "rateOverBalance": 0.9,
                   "timeSleep": 1000,
                   "minimumOrderAmount": 0.001,
                   "pyramiding": 2,
                   "stopLossPercent": 6,
                   "onetimeOrderAmount": 0.1
                }
              }
            * */
            //처음 매매할경우, setting.positions[symbol]항목이 없으므로 먼저 0으로 만들어준다.
            if (!(symbol in setting.positions)) {
                setting.positions[symbol] = { size: 0, pyramiding: 0 }
                await dynamodb.updatePosition(user, title, symbol, 0, 0)
            }

            //현재포지션
            const { size: qty, pyramiding } = setting.positions[symbol]
            if (qty > 0) {
                // 현재 피라미딩이 설정한 피라미딩 갯수에 도달했다면 추가 진입금지.
                if (pyramiding >= asset.pyramiding) {
                    //1. 롱이 이미 있다면 추가진입하지 않는다.
                    console.log(`이미 LONG 포지션이 존재하여 진입을 취소합니다. ${symbol} ${qty} PR[${pyramiding}]`);
                    return 0
                }
            } else if (qty < 0) {
                //2. 숏이 있다면 먼저 포지션을 닫는다.
                await this.noPosition(user, title, symbol, setting)
            } else {
                //3. 무포라면 바로 진입.
            }

            const exchangeHandler = this.getHandler(setting)
            const amount = await exchangeHandler.openLong(symbol, asset.rateOverBalance)
            if (amount > 0) {
                setting = await utils.loadSetting(user, title)
                const size = utils.floor4(setting.positions[symbol].size + amount)
                await dynamodb.updatePosition(user, title, symbol, size, pyramiding + 1)
                console.log(`자산증가 ${symbol} ${utils.floor4(setting.positions[symbol].size)} + ${utils.floor4(amount)} => ${size}`)
            }
            return utils.floor4(amount)
        } catch (e) {
            console.error(utils.getError(e))
            throw e
        }
    },
    /**
     * 선물 - 무 포지션
     * */
    noPosition: async function (user, title, symbol, setting) {
        try {
            if (! (symbol in setting.asset)) {
                throw new Error(`${symbol} 자산설정이 없어서 주문을 진행할수 없습니다.`)
            }
            // 현재수량
            //처음 매매할경우, setting.positions[symbol]항목이 없으므로 먼저 0으로 만들어준다.
            if (! (symbol in setting.positions)) {
                setting.positions[symbol].size = 0
                setting.positions[symbol].pyramiding = 0
                await dynamodb.updatePosition(user, title, symbol, NO_POSITION_SIZE, NO_POSITION_PYRAMIDING)
            }

            const exchangeHandler = this.getHandler(setting)
            const { size: qty, pyramiding } = setting.positions[symbol]
            if (qty > 0) {
                // 팔아라.
                const amount = await exchangeHandler.closeLong(symbol, qty)
                if (amount > 0) {
                    setting = await utils.loadSetting(user, title)
                    const size = utils.floor4(setting.positions[symbol].size - amount)
                    // 실제로 몇개 남는다고 해도 포지션은 0으로해야 다음에 포지션 진입이 가능하다.
                    await dynamodb.updatePosition(user, title, symbol, NO_POSITION_SIZE, NO_POSITION_PYRAMIDING)
                    console.log(`자산감소 ${symbol} ${utils.floor4(setting.positions[symbol].size)} - ${utils.floor4(amount)} => ${size}`)
                }
                return utils.floor4(amount)
            } else if (qty < 0) {
                // 사라.
                const amount = await exchangeHandler.closeShort(symbol, Math.abs(qty))
                if (amount > 0) {
                    setting = await utils.loadSetting(user, title)
                    const size = utils.floor4(setting.positions[symbol].size + amount)
                    // 포지션은 0이다.
                    await dynamodb.updatePosition(user, title, symbol, NO_POSITION_SIZE, NO_POSITION_PYRAMIDING)
                    console.log(`자산증가 ${symbol} ${utils.floor4(setting.positions[symbol].size)} + ${utils.floor4(amount)} => ${size}`)
                }
                return utils.floor4(amount)
            } else {
                //그대로.
                console.log(`${symbol} 에 닫을 포지션이 없습니다.`)
                return 0
            }
        } catch (e) {
            console.error(utils.getError(e))
            throw e
        }
    },
    /**
     * 선물 - 숏 포지션
     * */
    shortPosition: async function (user, title, symbol, setting) {
        try {
            if (!(symbol in setting.asset)) {
                throw new Error(`${symbol} 자산설정이 없어서 주문을 진행할수 없습니다.`)
            }
            const asset = setting.asset[symbol]

            if (! (symbol in setting.positions)) {
                setting.positions[symbol].size = 0
                setting.positions[symbol].pyramiding = 0
                await dynamodb.updatePosition(user, title, symbol, NO_POSITION_SIZE, NO_POSITION_PYRAMIDING)
            }
            //현재포지션
            const { size: qty, pyramiding } = setting.positions[symbol]
            if (qty > 0) {
                //1. 롱이 있다면 먼저 포지션을 닫는다.
                await this.noPosition(user, title, symbol, setting)
            } else if (qty < 0) {
                // 현재 피라미딩이 설정한 피라미딩 갯수에 도달했다면 추가 진입금지.
                if (pyramiding >= asset.pyramiding) {
                    //2. 숏이 이미 있다면 추가진입하지 않는다.
                    console.log(`이미 SHORT 포지션이 존재하여 진입을 취소합니다. ${symbol} ${qty} PR[${pyramiding}]`);
                    return 0
                }
            } else {
                //3. 무포라면 바로 진입.
            }

            const exchangeHandler = this.getHandler(setting)
            const amount = await exchangeHandler.openShort(symbol, asset.rateOverBalance)
            if (amount > 0) {
                setting = await utils.loadSetting(user, title)

                //처음 매매할경우, setting.positions[symbol]항목이 없으므로 먼저 0으로 만들어준다.
                if (!(symbol in setting.positions)) {
                    setting.positions[symbol].size = 0
                    setting.positions[symbol].pyramiding = 0
                }

                const size = utils.floor4(setting.positions[symbol].size - amount)
                await dynamodb.updatePosition(user, title, symbol, size, pyramiding + 1)
                console.log(`자산감소 ${symbol} ${utils.floor4(setting.positions[symbol].size)} - ${utils.floor4(amount)} => ${size}`)
            }
            return utils.floor4(amount)
        } catch (e) {
            console.error(utils.getError(e))
            throw e
        }
    },

    getHandler: function (setting) {
        const exchange = setting['exchange']
        const handler = require('./handler/' + exchange)
        handler.init(setting['key'], setting['secret'])
        // 셋팅을 최신으로 업데이트.
        handler.updateSettings(setting)
        return handler
    }
}