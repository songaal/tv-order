const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3000
app.use(bodyParser.json())

/**
 * AWS 람다 서버를 시뮬레이션 해주는 서버.
 * 람다에서는 index.js만 사용한다.
 *
 * */
const index = require('./index-order')

app.post('/orders', async (req, res) => {
    let ret = await index.handler(req.body)
    res.send(ret)
})

app.get('/', (req, res) => {
    res.send('TV Order API')
})

app.post('/', (req, res) => {
    res.send('TV Order API (POST)')
})

app.listen(port, () => {
    console.log(`Server Listening.. http://localhost:${port}`)
})