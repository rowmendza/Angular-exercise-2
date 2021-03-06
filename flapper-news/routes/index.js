var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

/*GET post */
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

router.get('/posts', function(req, res, next) {
    Post.find(function(err, posts){
        if(err){ return next(err); }
        
        res.json(posts);
    });
});

/*POST*/
router.post('/posts', function(req, res, next) {
  var post = new Post(req.body);

  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

/*Pre-loading Objects*/

router.param('post', function(req, rest, next,id) {
  var query = Post.findById(id);
  
  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find post')); }
    
    req.post = post;
    return next();
  });
});

/*Return a Single Post */
router.get('/posts/:post', function(req, res) {
  res.json(req.post);
});

/*upvote route*/
router.put('/posts/:post/upvote', function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }
    
    res.json(post);
  });
});

/*Create a comment*/
router.post('/posts/:post/comments', function(req, res, next) {
    var comment = new Comment(req.body);
    comment.post = req.post;
    
    comment.save(function(err, comment){
      if(err){ return next(err); }
      
      req.post.comments.push(comment);
      req.post.save(function(err, post){
        if(err){ return next(err); }
        
        res.json(comment);
      });
    });
});

/*preloading comments*/
router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
  });
});

/*retrieve comments */
router.get('/posts/:post', function(req, res, next) {
  req.post.populate('comments', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});