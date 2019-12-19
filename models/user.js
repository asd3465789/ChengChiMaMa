///資料庫程式

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/testdatabase');

var db = mongoose.connection;

//User Schema
//使用者資料
var UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password: {
    type: String
  },
  email: {
    type: String
  },
  name: {
    type: String
  },
  dateofbirth: {
    type: Date
  },
  country: {
    type: String
  }
});

var User = module.exports = mongoose.model('User', UserSchema);

//從ID搜尋使用者
module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
}

//從使用者名稱搜尋使用者
module.exports.getUserByUsername = function(username, callback){
  var query = {username: username};
  User.findOne(query, callback);
}

//比對密碼
module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch){
    callback(null, isMatch); //比對正確回傳true
  });
}

//創建使用者
module.exports.createUser = function(newUser, callback){
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}
