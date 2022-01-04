const settings = require('./settings')

/**

 POST /order
 {
  "passcode": "<pass>",
  "exchange": "upbit",
  "symbol": "BTC/KRW",
  "position":"{{strategy.position_size}}",
  "size": "100%",
  "futures": false
 }
 *
 * */
exports.handler = async (event, context, callback) => {

    const exchange = event['exchange']
    const passcode = event['passcode']
    const symbol = event['symbol']
    const position = event['position']
    const size = event['size']
    const futures = event['futures']

    if (passcode != settings.MY_PASSCODE) {
        //패스코드 틀림.
        console.error(`인증실패 ${settings.NAME} ${passcode}`)
        return {
            statusCode: 400,
            body: "인증실패. 잘못된 패스코드입니다.",
        };
    }

    console.log(`Request Started! ${settings.NAME} ${exchange} ${symbol} ${position}`)

    try {
        let ret
        if (! futures) {
            // 현물
            if (position > 0) {
                ret =  await exchange.buy(user, title, symbol, setting)
            } else if (position <= 0) {
                ret = await exchange.sell(user, title, symbol, setting)
            }
        } else {
            // 선물
            if (position > 0) {
                ret =  await exchange.longPosition(user, title, symbol, setting)
            } else if (position == 0) {
                ret = await exchange.noPosition(user, title, symbol, setting)
            } else if (position < 0) {
                ret = await exchange.shortPosition(user, title, symbol, setting)
            }
        }
        console.log(`Request Finished! ${user} ${title} ${symbol} ${position}`)

        const response = {
            statusCode: 200,
            body: JSON.stringify(ret),
        };
        return response;
    } catch(e) {
        const response = {
            statusCode: 500,
            body: JSON.stringify(e),
        };
        return response;
    }
};
