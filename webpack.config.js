const path = require('path')

module.exports = {
    mode: 'development',
    entry: './index.ejs',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    }
}