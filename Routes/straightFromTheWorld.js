let Parser = require("rss-parser");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const straightFromTheWorld =require("../models/straightFromTheWorld");
const { default: axios } = require("axios");
const { requireAuth } = require("../Middleware/Authentication");
let parser = new Parser({
    headers: { "User-Agent": "Chrome" },
  });


async function fetchRssFeed(feedUrl) {
    // console.log(el)
    // rssLink.push(el.link))
    let feed = await parser.parseURL(feedUrl);
    return feed.items.map((item) => {
      // console.log(item)
      // if(item?.categories.includes(categoryParam)){
      //   return
      // }

      const straightFromTheWorlds=new straightFromTheWorld({
        _id: new mongoose.Types.ObjectId(),
                
        title: item.title,
        link: item.link,
        date: item.pubDate,
        content:item.content,
        category:item.categories,
        creator:item.creator,
        summary:item.summary,
        contentSnippet:item.contentSnippet,
        // enclosure:item?.enclosure,
        id:item?.guid,
              });
   straightFromTheWorlds.save();
   
//    .then((result)=>{
//    return result

//    })


      return {
        title: item.title,
        link: item.link,
        date: item.pubDate,
        content:item.content,
        category:item.categories,
        creator:item.creator,
        summary:item.summary,
        contentSnippet:item.contentSnippet,
        enclosure:item?.enclosure,
        id:item?.guid
  
        //websitename
        //
      };
    });
  }





  router.get("/getFeed", async (req, res) => {
    // if(req.header('token')==="koinpratodayqproductrsstoken"){
  
      const responseArray = [];
      // console.log(link)
      // for(var i=0;i<link.length;i++){
        let link= await axios.get("http://localhost:5000/rss").then((res)=>res.data?.rssData)
        
    for(var i=0;i<link?.length;i++){
    
      await fetchRssFeed(link[i]?.link)
        .then((data) => {
        //     console.log(data,"data")
        //   res.status(200).json(data);
          responseArray.push(data);
//           const straightFromTheWorlds=new straightFromTheWorld({
//     _id: new mongoose.Types.ObjectId(),
            
//             ...data,
//           });
// const feed=   straightFromTheWorlds.save();
// // console.log(feed)
// res.status(200).send({ success: true, feed });

        })
        .catch((err) => {
          res.status(500).json({
            status: "error",
            message: "No news found",
          });
        });
      };
      res.status(200).json({message:"Rss Feed Data Fetched Successfully",feedData:responseArray});
    // }else{
    // res.status(401).send({ success: false, message: "Unauthorized !!!" });
  
    // }
  });

  router.get("/getFeedCategory",requireAuth, async (req, res) => {
    console.log(req.params)
    const categoryParam = req.query["category"];
  console.log(categoryParam,"cat")
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
      const responseArray = [];
      // console.log(link)
      // for(var i=0;i<link.length;i++){
        let link= await axios.get("http://localhost:5000/rss").then((res)=>res.data?.rssData)
        
    for(var i=0;i<link?.length;i++){
    
      await fetchRssFeed(link[i]?.link)
        .then((data) => {
          // res.status(200).json(data);
          responseArray.push(data);
        })
  
        
        .catch((err) => {
          res.status(500).json({
            status: "error",
            message: "No news found",
          });
        });
      };
  
  
    // var filteredData=  responseArray.filter((el)=>el.category?.includes(categoryParam.trim()))
  // console.log(filteredData,"filtered")
  const filteredArr=[]
  // console.log(responseArray.category,"res")
  for(var i=0;i<responseArray.length;i++){
  
    responseArray.map((el)=>{
      console.log(el[i].category,"cataa")
      console.log(categoryParam)
      if(el[i].category.includes(categoryParam)){
        filteredArr.push(el[i])
        // console.log(el,"el")
      }else{
        return
      }
    })
  //   var filteredData=  responseArray.filter((el)=>el[i].category?.includes(categoryParam.trim()))
  // console.log(filteredData)
  }
  // console.log(filteredArr,"filteredArr")
  
    //   const filteredUsers = responseArray.filter(el => {
    //   let isValid = true;
    //   for (key in categoryParam) {
    //     console.log(key, el[key], categoryParam[key]);
    //     isValid = isValid && el[key] == categoryParam[key];
    //   }
    //   return isValid;
    // });
    // console.log(filteredUsers)
  
  
  
    // res.send(filteredUsers);
      res.status(200).json(filteredArr);
    // }else{
    // res.status(401).send({ success: false, message: "Unauthorized !!!" });
  
    // }
  });






//   router.get("/get-all", (req, res) => {
//     // if(req.header('token')==="koinpratodayqproductrsstoken"){
  
//     straightFromTheWorld.find()
//       .select("link id title summary contentSnippet  date creator content category _id ")
//       .exec()
//       .then((docs) => {
//           const response = {
//               count: docs.length,
//               rssFeedData:docs,
//               rssFeedData: docs.map((doc) => {
//               console.log(doc,"doc")
//             return {
//               link: doc.link,
//               title: doc.title,
//               date: doc.date,
//               content: doc.content,
//               category: doc.category,
//               creator: doc.creator,
//               summary: doc.summary,
//               contentSnippet: doc.contentSnippet,
//               id: doc.id,
             
//               _id: doc._id,
//               request: {
//                 type: "GET",
//                 // url: "http://localhost:3000/rss/",
//               },
//             };
//           }),
//         };
//         //   if (docs.length >= 0) {
//         res.status(200).json(response);
//         //   } else {
//         //       res.status(404).json({
//         //           message: 'No entries found'
//         //       });
//         //   }
//       })
//       .catch((err) => {
//         console.log(err);
//         res.status(500).json({
//           error: err,
//         });
//       });
//     // }
//     // else{
//     //   res.status(401).send({ success: false, message: "Unauthorized !!!" });
  
//     // }
//   });


//Get all Method
router.get("/get-all",requireAuth, async (req, res) => {
    console.log(req.query);
    const straightFromTheWorldData = await straightFromTheWorld.find(req.query);
    res.status(200).send({ success: true, data: straightFromTheWorldData });
  });
  router.delete("/delete/:id", async (req, res) => {
    const straightFromTheWorldData = await straightFromTheWorld.findByIdAndDelete(req.params.id);
  
    res.send({ success: true, data: straightFromTheWorldData, message: "Rss feed Deleted Successfully" });
  });

  router.get("/getBitcoinFeed",requireAuth,async(req,res)=>{
    var query = { category: "Bitcoin" };  
    const straightFromTheWorldData = await straightFromTheWorld.find(query);
// console.log(straightFromTheWorldData,"straightFromTheWorldData")
res.send({ success: true, data: straightFromTheWorldData, message: "Bitcoin Rss feed Fetched Successfully" });

  })
  router.get("/getEthereumFeed",requireAuth,async(req,res)=>{
    var query = { category: "Ethereum" };  
    const straightFromTheWorldData = await straightFromTheWorld.find(query);
// console.log(straightFromTheWorldData,"straightFromTheWorldData")
res.send({ success: true, data: straightFromTheWorldData, message: "Ethereum Rss feed Fetched Successfully" });

  })
  router.get("/getWeb3Feed",requireAuth,async(req,res)=>{

    var query = { category: "Web3" };  
    const straightFromTheWorldData = await straightFromTheWorld.find(query);
// console.log(straightFromTheWorldData,"straightFromTheWorldData")
res.send({ success: true, data: straightFromTheWorldData, message: "Web3 Rss feed Fetched Successfully" });

  })
  router.get("/getMetaverseFeed",requireAuth,async(req,res)=>{

    var query = { category: "Metaverse" };  
    const straightFromTheWorldData = await straightFromTheWorld.find(query);
// console.log(straightFromTheWorldData,"straightFromTheWorldData")
res.send({ success: true, data: straightFromTheWorldData, message: "Metaverse Rss feed Fetched Successfully" });

  })
  router.get("/getCBDCFeed",requireAuth,async(req,res)=>{

    var query = { category: "CBDC" };  
    const straightFromTheWorldData = await straightFromTheWorld.find(query);
// console.log(straightFromTheWorldData,"straightFromTheWorldData")
res.send({ success: true, data: straightFromTheWorldData, message: "CBDC Rss feed Fetched Successfully" });

  })
  router.get("/getNFTFeed",requireAuth,async(req,res)=>{

    var query = { category: "NFT" };  
    const straightFromTheWorldData = await straightFromTheWorld.find(query);
// console.log(straightFromTheWorldData,"straightFromTheWorldData")
res.send({ success: true, data: straightFromTheWorldData, message: "NFT Rss feed Fetched Successfully" });

  })
module.exports = router;
