// to use our .env file variables, we must use this command
require("dotenv").config();
const express = require('express')
const app = express()

const PORT = process.env.PORT

app.get('/', (req, res) => {
    res.send("200 OK")
})

app.listen(PORT, () =>{ 
    console.log(`Server Running On Port ${PORT}`)
})