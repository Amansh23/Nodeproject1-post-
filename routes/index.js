var express = require('express');
const { redirect } = require('express/lib/response');
var router = express.Router();
const passport = require("passport");
const passportLocal = require("passport-local")
const userModel = require("./users")
const postModel = require("./post")
const multer = require("multer")

passport.use(new passportLocal(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/upload')
  },
  filename: function (req, file, cb) {
    const uniq = Date.now() + Math.floor(Math.random()*1000) + file.originalname
    cb(null, uniq)
  }
})

const upload = multer({ storage: storage })

router.get('/', function(req, res) {
  res.render('index');
});

router.get("/profile",isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .populate("posts")
  .then(function(data){
    res.render('profile',{data})
  })
})

router.post("/upload",isLoggedIn,upload.single('images'),function(req,res){
  userModel.findOne({
    username:req.session.passport.user
  }).then(function(foundeduser){
    console.log(foundeduser.File)
    foundeduser.File = req.file.filename
    foundeduser.save()
    .then(function(saved){
      res.redirect('/profile')
    })
  })
})



router.post("/register",function(req,res){
  var newUser = new userModel({
    username:req.body.username,
    name:req.body.name
  });
  userModel.register(newUser,req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile")
    });
  });
});


router.post("/login",passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/"
}),function(req,res){
 
});


router.get("/logout",function(req,res){
  req.logOut();
  res.redirect("/")
});



function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res,redirect('/');
  }
}


router.post("/post",isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user}).then(function(loggedinuser){
    postModel.create({
      post:req.body.newpost,
      userid:loggedinuser._id
    }).then(function(createdpost){
      loggedinuser.posts.push(createdpost._id);
      loggedinuser.save()
      .then(function(saveduser){
        res.redirect("/profile");
      })
      })
    })
  })

router.get("/likes/:id",isLoggedIn,function(req,res){
  userModel.findOne({
    username:req.session.passport.user
  }).then(function(foundeduser){
    postModel.findOne({
      _id:req.params.id
    }).then(function(foundedpost){
     if(foundedpost.likes.indexOf(foundeduser._id)=== -1){
       foundedpost.likes.push(foundeduser._id)
     }
     else{
       var kahape =foundedpost.likes.indexOf(foundeduser._id)
       foundedpost.likes.splice(kahape,1)
     }
     foundedpost.save()
     .then(function(saveddata){
       res.redirect(req.headers.referer)
     })
    })
  })
  
})


router.post("/comment/:postid" ,isLoggedIn,function(req,res){
  userModel.findOne({
    username:req.session.passport.user
  }).then(function(foundeduser){
    postModel.findOne({
      _id:req.params.postid
    }).then(function(foundedpost){
      foundedpost.comments.push({name:foundeduser.name},{comment:req.body.comment})
      foundedpost.save()
      .then(function(savedcomment){
        res.redirect(req.headers.referer);
      })
    })
  })
})



router.get("/feed",isLoggedIn,function(req,res){
  userModel.findOne({
    username:req.session.passport.user
  }).then(function(data){
    postModel.find()
    .then(function(foundpost){
     res.render("feed",{foundpost,data})
    })   
  })
 
})

router.get("/qqq",function(req,res){
  postModel.find().then(function(allpost){
    res.send(allpost);
  })
})

router.get("/aaa",function(req,res){
  userModel.find().then(function(allpost){
    res.send(allpost);
  })
})
module.exports = router;
