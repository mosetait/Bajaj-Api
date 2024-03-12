const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");


dotenv.config();


// middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(helmet());
app.use(morgan("combined"));

// app.use(
//     cors({
//         origin: "http://localhost:3000",
//         credentials: true,
//     })
// );


// Routes
const admin = require("./routes/Admin");
const bajaj = require("./routes/Bajaj");


app.use("/api/v1" , admin );
app.use("/api/v1" , bajaj );


// default route
app.get("/" , (req,res,next) => {
    return res.end("<h1>Server is running</h1>")
})


app.listen(process.env.PORT , () => {
    console.log(`Server is running on PORT : ${process.env.PORT}`)
})