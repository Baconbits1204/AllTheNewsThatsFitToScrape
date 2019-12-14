// Requirements ==========================================================================
let axios = require('axios'); // HTTP Request
let cheerio = require('cheerio'); // Web Scrapper
let mongoose = require('mongoose'); // MongoDB ORM
let db = require("../models"); // Require all models

//Mongo/mongoose DB configuration=========================================================================================
// let mongoose useES6 Promises
mongoose.Promise = Promise; 
//connect to DB
const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/allthenews";
mongoose.connect(dbURI, {
  useNewUrlParser: true
});
let mongooseConnection = mongoose.connection;
//if there is an error connecting log the following
mongooseConnection.on('error', console.error.bind(console, 'There was an error connecting to the database'));
//if connection is successful, log the following
mongooseConnection.once('open', function() {
  console.log(`You are connected to your mongo database`); 
});

//module function to export with this file, including routes ===================================================
module.exports = (app) => { 
  //Index route get request========================================================================
  app.get("/", (req, res) => res.render("index"));

  // Scraping Route====================================================================
  app.get("/api/search", (req, res) => {//grab NPR as a response
    axios.get("https://www.npr.org/sections/news/").then(response => {
      // load response in cheerio and give that datta a $ variable
      let $ = cheerio.load(response.data);
      // Create empty object to store data from the cherrio response "$"
      let handlebarsObject = {
        data: []
      }; 
      // Use Cheerio to Search for all <article> Tags
      $("article").each((i, element) => { 
        //Turn low res images into high res images
        //**URL string manipulation
        let badQualityPhoto = $(element).children('.item-image').children('.imagewrap').children('a').children('img').attr('src');

        if (badQualityPhoto) {

          let imageLength = badQualityPhoto.length;
          let goodQualityPhoto = badQualityPhoto.substr(0, imageLength - 11) + "800-c100.jpg";

          //push scraped data into handlebars obj=============================================================
          handlebarsObject.data.push({ 
            headline: $(element).children('.item-info-wrap').children('.item-info').children('.title').children('a').text(),
            summary: $(element).children('.item-info-wrap').children('.item-info').last().first().text(),
            url: $(element).children('.item-info-wrap').children('.item-info').children('.title').children('a').attr('href'),//something href related?,
            imageURL: goodQualityPhoto,
            slug: $(element).children('.item-info').children('.slug-wrap').children('.slug').children('a').text(),
            comments: null
          }); 
        } 
      });
      console.log(handlebarsObject);
      res.render("index", handlebarsObject);
    });
  });

    //Post route to add article to saved================================================================
    app.post("/api/add", (req, res) => { 
      let displayedArticle = req.body;
      db.Articles. 
      // Check saved articles for the same URL to avoid duplicates
      findOne({url: displayedArticle.url}). 
      then(function(response) {
      // if URL does not exist in saved data already, save the data.
        if (response === null) { 
          db.Articles.create(displayedArticle).then((response) => console.log(" ")).catch(err => res.json(err));
        }  else {
          console.log("fail")
      }
        // when if statement concludes, message sent to front end...
        res.send("Article Saved");
      }).catch(function(err) {
        // display an error if an error occurs instead
        res.json(err);
      });
  
    });

  // get request to pull saved articles ==================================================
  app.get("/api/savedArticles", (req, res) => {
    // search articles collection in DB for saved articles
    db.Articles.find({}). 
    // Then send articles to front end if found
    then(function(dbArticle) {
      res.json(dbArticle);
    //or send an error if not found
    }).catch(function(err) {
      res.json(err);
    });
  });



  // post route to delete saved article ===============================================================
  app.post("/api/deleteArticle", (req, res) => {
  
    sessionArticle = req.body;
  // grab article by ID and delete "findByIDAndRemove"
    db.Articles.findByIdAndRemove(sessionArticle["_id"]). 
    then(response => {
      if (response) {
        res.send("Sucessfully Deleted");
      } else {
        console.log("fail")
    }
    });
  }); 

  // post route to delete comment ======================================================
  app.post("/api/deleteComment", (req, res) => {
    let comment = req.body;
    // grab comment by ID and delete "findByIDAndRemove"
    db.Notes.findByIdAndRemove(comment["_id"]). 
    then(response => {
      //notify user if comment is deleted
      if (response) {
        res.send("Sucessfully Deleted");
      }  else {
        console.log("fail")
    }
    });
  }); // End deleteArticle Route

  // Create Notes Route
  app.post("/api/createNotes", (req, res) => {

    sessionArticle = req.body;

    db.Notes.create(sessionArticle.body).then(function(dbNote) {
      // console.log(dbNote);
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Articles.findOneAndUpdate({
        _id: sessionArticle.articleID.articleID
      }, {
        $push: {
          note: dbNote._id
        }
      });
    }).then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    }).catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  }); // End deleteArticle Route

  // Route for grabbing a specific Article by id, populate it with it's note
  app.post("/api/populateNote", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    // console.log("ID is "+ req.body.articleID);

    db.Articles.findOne({_id: req.body.articleID}).populate("Note"). // Associate Notes with the Article ID
    then((response) => {
      // console.log("response is " + response);

      if (response.note.length == 1) { // Note Has 1 Comment

        db.Notes.findOne({'_id': response.note}).then((comment) => {
          comment = [comment];
          console.log("Sending Back One Comment");
          res.json(comment); // Send Comment back to the Client
        });

      } else { // Note Has 0 or more than 1 Comments

        console.log("2")
        db.Notes.find({
          '_id': {
            "$in": response.note
          }
        }).then((comments) => {
          // console.log("Sending Back Multiple Comments");
          res.json(comments); // Send Comments back to the Client
        });
      }
      // If we were able to successfully find an Article with the given id, send it back to the client
    }).catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  }); // End of Post Populate Note

} 