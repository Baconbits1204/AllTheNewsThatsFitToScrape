let mongoose = require('mongoose');

let Schema = mongoose.Schema; // Save a Reference to the Schema Constructor


var commentSchema = new Schema({
  
  // `body` is of type String
  body: String

});

// empty model from the above schema, using mongoose .model method
var Comment = mongoose.model("Comment", commentSchema);

// Export the Comment model
module.exports = Comment;