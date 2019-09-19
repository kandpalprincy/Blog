//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const truncate= require(__dirname + "/truncate.js");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: 'keyboard cat',
  resave : false,
  saveUninitialized : true,
 }));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/postDB",{ useUnifiedTopology: true ,useNewUrlParser: true });
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  username : String,
  password : String
});

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User" ,userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const postsList= [];


const postSchema = new mongoose.Schema({
     postTitle: String,
     postBody : String
});

const Post = mongoose.model("Post",postSchema);


app.get("/",function(req,res){

    Post.find(function(err,postlist){
        if(err)
        console.log(err);
        else
        res.render("home",{homeStartingContent:homeStartingContent, postsList:postlist});
    });


});

app.get("/signup",function(req,res){
  res.render("signup");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/about",function(req,res){
  res.render("about",{aboutContent:aboutContent});
});

app.get("/contact",function(req,res){
  res.render("contact",{contactContent:contactContent});
});

app.get("/compose",function(req,res){
  res.render("compose");
});

app.get("/posts/:id",function(req,res){

       const para= req.params.id;
      
       Post.findOne({_id:para},function(err,post){

             if(err)
             console.log(err);
             else
             res.render("posted",{post:post});
       });


});

app.post("/signup",function(req,res){


  User.register({username:req.body.username},req.body.password, function(err, user) {
    if (err)
    {
      console.log(err);
      res.redirect("/signup");
    }
    else
    passport.authenticate("local")(req, res,function() {
    res.render("home",{homeStartingContent:homeStartingContent, postsList:postlist});

  // Value 'result' is set to false. The user could not be authenticated since the user is not active
    });
});

});

app.post("/login",function(req,res){

  const user = new User({
    username : req.body.username,
    password : req.body.password
  });
   req.login(user, function(err) {
   if (err)
   {
     console.log(err);
   }
   else
   {
    passport.authenticate("local")(req,res,function(){
      res.redirect("/");
    });
  }
 });

});

app.post("/compose",function(req,res){

   const postTitle = req.body.postTitle;
   const postBody  = req.body.postBody;

   const post = new Post({
    postTitle: postTitle,
    postBody : postBody
  });

  post.save(function(err){
    if(!err)
    {
      postsList.push(post);

    }
    res.redirect("/");
  });
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
