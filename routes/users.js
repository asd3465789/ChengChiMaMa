var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

///GET清單
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', {title: 'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title: 'Login'});
});

router.get('/home', function(req, res, next) {
  res.render('home', {title: 'Home'});
});
///--------

///申請帳號
router.post('/register', function(req, res, next) {

  ///取得申請帳號資料
  var name = req.body.name;
  var dateofbirth = req.body.dateofbirth;
  var country = req.body.country;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  ///驗證資料是否被使用
  req.checkBody('name', 'Your name is required').notEmpty();
  req.checkBody('dateofbirth', 'Your date of birth is required').notEmpty();
  req.checkBody('country', 'Your country of origin is required').notEmpty();
  req.checkBody('email', 'Your email is required').notEmpty();
  req.checkBody('email', 'The email is not valid').isEmail();
  req.checkBody('username', 'A username is required').notEmpty();
  req.checkBody('password', 'A password is required').notEmpty();

  ///驗證確認密碼是否正確
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();
  if(errors){
    ///如果錯誤顯示錯誤
    res.render('register', {errors: errors});
  } else {

    ///統整申請帳號資料
    var newUser = new User({
      name: name,
      dateofbirth: dateofbirth,
      country: country,
      email: email,
      username: username,
      password: password
    });

    ///將資料丟進資料庫
    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });

    req.flash('success', 'You have completed your registration');

    res.location('/users/login');
    res.redirect('/users/login');
  }
});
///--------

//登入帳號
router.post('/login', passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: 'Invalid username or password'}),
function(req, res) {
  req.flash('success', 'You have successfully logged in');
  res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){ ///使用LocalStrategy驗證
  User.getUserByUsername(username, function(err, user){            ///從資料庫搜尋使用者並取得使用者
    if(err) throw err;                                             
    if(!user){                                                     ///如果使用者不存在
      return done(null, false, {message: 'Unknown User'});
    }
    User.comparePassword(password, user.password, function(err, isMatch){   ///比對密碼
      if (err) return done(err);
      if(isMatch){                                                          ///判定回傳結果
        return done(null, user);
      } else {
        return done(null, false, {message: 'Invalid Password'});
      }
    });
  });
}));

router.get('/logout', function(req, res, next){
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
});

module.exports = router;
