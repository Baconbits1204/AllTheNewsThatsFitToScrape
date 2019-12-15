// Requirements ===========================================================================================
let mongoose = require('mongoose');

// initialize db schema ===================================================================================
let Schema = mongoose.Schema; // Save a Reference to the Schema Constructor

// define schema ==========================================================================================

let ArticleSchema = new Schema({ // Create a New Schema Constructor for News Article

  headline: {
    type: String,
    required: true
  },

  summary: {
    type: String,
    required: true
  },

  url: {
    type: String,
    required: true
  },

  imageURL: {
    type: String,
    required: true
  },

  slug: {
    type: String
  },

  // link object id to note model to populate comments
  note: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]

}); 

//Export ===========================================================================================
let Article = mongoose.model("Article", ArticleSchema);
// Export the Article Model
module.exports = Article; 