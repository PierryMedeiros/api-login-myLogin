var bodyParser = require('body-parser')
var express = require("express")
var app = express()
const cors = require('cors')
var router = require("./routes/routes")
 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use(cors());

app.use("/",router);

app.listen(8686,() => {
    console.log("Servidor rodando")
});
