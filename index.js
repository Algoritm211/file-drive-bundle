const express = require('express')
const mongoose = require('mongoose')
const config = require('config')
const fileUpload = require('express-fileupload')
const authRouter = require('./routes/auth.routes')
const fileRouter = require('./routes/file.routes')
const cors = require('cors');
const path = require('path')
const fileMiddleware = require("./middlewares/files.middleware");

const app = express()
const PORT = process.env.PORT || config.get('serverPORT')
const dbURL = config.get('dbURL')

app.use(fileUpload({}))
// app.use(cors());
app.use(fileMiddleware(path.resolve(__dirname, 'files')))
app.use(express.static('static'))
app.use(express.json())
app.use('/api/auth/', authRouter)
app.use('/api/files/', fileRouter)

const startApp = async () => {
  try {

    await mongoose
      .connect( dbURL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false, tls: true })
      .then(() => console.log( 'Database Connected' ))
      .catch(err => console.log( err ));

    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.log(error)
  }
}

startApp()
