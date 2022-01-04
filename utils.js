module.exports = {
    sleep: (ms) => {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    },
    getError: (e) => {
        if (e['message']) {
            return 'Error: ' + e['message']
        } else if (e['body']) {
            return 'Error: ' + e['body']
        } else {
            return 'Error: ' + e
        }
    }
}