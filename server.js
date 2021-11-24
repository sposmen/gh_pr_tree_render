const express = require('express')
const app = express()
const port = 3000
const serveIndex = require('serve-index');
const path = require('path')

app.use('/graphs', express.static(path.join(__dirname,"graphs")));
app.use('/graphs', serveIndex(path.join(__dirname, 'graphs')));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
