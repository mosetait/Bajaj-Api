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
// Define a middleware function to handle all GET requests
app.use((req, res, next) => {
    if (req.method === 'GET') {
        // Send the same response for all GET requests
        return res.json({
            responseStatus: "-6",
            responseMessage: "Only Post Method Allowed"
        })

    } 
    else {
        // Pass the request to the next middleware
        next();
    }
});

app.listen(process.env.PORT , () => {
    console.log(`Server is running on PORT : ${process.env.PORT}`)
})