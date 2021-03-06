const express = require('express')
const app = express()

const routesReport = require('rowdy-logger').begin(app)

const path = require('path')

const replaceInFile = require('replace-in-file')

app.get('/background.jpeg', (req, res) => {
    const filepath = path.join(__dirname, 'background.jpeg')
    res.sendFile(filepath)
})

app.get('/', (req, res) => {
    const filepath = path.join(__dirname, 'index.html')
    res.sendFile(filepath)
})

app.get('/main.js', async (req, res) => {
    const filepath = path.join(__dirname, 'main.js')

    if (process.env.NODE_ENV === 'production') {
        await replaceInFile({
            files: filepath,
            from: 'http://localhost:3001',
            to: 'https://event-planner-seir1011.herokuapp.com'
        })
    }
    res.sendFile(filepath)
})

app.get('/style.css', (req, res) => {
    const filepath = path.join(__dirname, 'style.css')
    res.type('css').sendFile(filepath)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`server listening on port ${port}`)
    routesReport.print()
})