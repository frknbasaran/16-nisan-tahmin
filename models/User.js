var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  photo: {type:String},
  name: {type:String},
  nick: {type:String},
  bet: {
    yes:{type:String},
    no: {type:String}
  },
  tokens: Array
}, { timestamps: true });

var User = mongoose.model('User', userSchema);

module.exports = User;