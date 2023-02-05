// require("dotenv").config();

// const mongoString = process.env.mongoUri;
// // mongoose.connect("mongodb+srv://koinpr:koinpr@cluster0.r5h45t0.mongodb.net/?retryWrites=true&w=majority");
// mongoose.connect(mongoString);
// const database = mongoose.connection;
// database.on("error", (error) => {
//   console.log(error);
// });

// database.once("connected", () => {
//   console.log("Database Connected");
// });

const mongoose = require('mongoose')

const DB = process.env.DATABASE

mongoose.connect(DB,{
   useCreateIndex:true,
   useNewUrlParser:true,
   useUnifiedTopology:true,
   useFindAndModify:false,

}).then(()=>{
   console.log(`Connection successful`)
}).catch((err)=>{
   console.log('No connection')
})