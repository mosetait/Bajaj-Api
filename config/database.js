const mongoose = require("mongoose");

const connectDB = () =>  mongoose.connect(process.env.BAJAJ_MONGO_CREDS , {

    useNewUrlParser: true,
    useUnifiedTopology: true,

}).then((data) => {console.log(`Database Connected`)})
.catch((error) => {console.log(`Failed to connect with database : ${error}`)})

module.exports = connectDB;