var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/test' );
var Schema = mongoose.Schema;

//session
var expressSession = require('express-session');
router.use(expressSession({secret: 'max', saveUninitialized: false, resave: false}));

//user schema
var userDataSchema = new Schema({
    username:       {type: String, required: true},
    password:       {type: String, required: true},
    firstname:      {type: String, required: true},
    lastname:       {type: String, required: true},
    streetaddress:  {type: String, required: false},
    email:          {type: String, required: false},
    phonenumber:    {type: String, required: false},
    phonenumber2:   {type: String, required: false},
    birthday:       {type: Date, required: false},
    children:       [{type: Schema.Types.ObjectId, ref: 'Child'}]
    }, {collection: 'data'});

//child schema
var childDataSchema = new Schema({
    firstname:      {type: String, required: true},
    lastname:       {type: String, required: true},
    birthday:       {type: Date, required: true},
    grade:          {type: Number, min: 1, max: 8, required: true}
    }, {collection: 'children'});

//instantiate schema as models "User" and "Child"
var User = mongoose.model('User', userDataSchema);
var Child = mongoose.model('Child', childDataSchema);

// get home page
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Church Centre' , cuck:'liam'
    , success: false, errors: req.session.errors});
    req.session.errors = null;
});

//get schedule page
router.get('/schedule', function(req, res, next){
    res.render('schedule', {title:'Church Centre'});
});
router.get('/logout', function(req, res, next){
   req.session = new session();

});

//get account page
//ADDED: Session information
router.get('/account', function (req, res, next) {
    var sess = req.session;
    var userData = sess.userDat;

    if(sess.logged) {
        var bday = new Date (userData.birthday).toUTCString();
        console.log(bday);
        res.render('account', {
            user: sess.username,
            title: 'Church Centre',
            firstname: userData.firstname,
            lastname: userData.lastname,
            dob: bday,
            email: userData.email,
            ph1: userData.phonenumber,
            ph2: userData.phonenumber2
        });
    }
    else {
        res.redirect('localhost:3000')
    }
});

//get login page
router.get('/login', function (req, res, next) {
    res.render('login', {title: 'Church Centre'});
});

//get register page
router.get('/register', function (req, res, next) {
    res.render('register', {title: 'Church Centre'});
});

//get register page
router.get('/registerchild', function (req, res, next) {
    var sess = req.session;
    var userData = sess.userDat;
    if(sess.logged) {
        res.render('registerchild', {user: userData.username});
    }
    else {
        res.render('index', {title: 'ya dun goofed kid'});
    }
});

//get homepage2 (the nice page that will you bust a nut!)
//ADDED: SESSION INFO
router.get('/homepage2', function (req, res, next) {
    var userInfo = req.session;
    if(userInfo.logged)
    {
        res.render('homepage2', {user: userInfo.username, title: 'Church Centre'});
    }
    else
    {
        res.redirect('localhost:3000');
    }

});

//get calender page currently a work in progress
router.get('/calendar', function (req, res, next) {
    res.render('calendar', {});
});

//get test data page "database button on '/index'
router.get('/get-data', function (req, res, next) {
    User.find()
        .populate('children')
        .then(function(doc) {
            if(doc.length > 0) {
                res.render('database', {items: doc});
            }
            else {
                res.render('index', {title: "database empty!!"});
            }
        });
});

// post page for register
router.post('/register', function (req, res, next){
    var item = {
        username: req.body.username,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        streetaddress: req.body.streetaddress,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
        phonenumber2: req.body.phonenumber2,
        birthday: req.body.birthday
    };
    req.check('lastname', 'Invalid last name').isLength({min:2});
    req.check('firstname','Invalid first name').isLength({min:4});
    var errors = req.validationErrors();

    if(!errors){
        var data = new User(item);
        //res.render(('homepage2'),{a : item.firstname, b : item.lastname, resultlist: 'cuck'});
        data.save();
        //LOGGING IN NEW USER - temp fix  || S.N.
        var sessData = req.session;
        sessData.logged = true;
        sessData.username = item.username;
        sessData.userDat = item;
        console.log(sessData.userDat.email);
        //res.render('homepage2', {user: sessData.username, a: doc[0]._doc.username, b: doc[0]._doc.password, resultlist: doc[0]._doc._id});
        res.redirect('/homepage2');
        //var child = window.confirm("Add Child?\nEither OK or Cancel.\nThe button you pressed will be displayed in the result window.")
        //{
        //    window.open("exit.html", "Thanks for Visiting!");
        //};
        //if(child == true)
        //{
        //    res.render(('registerchild'),{a : item.firstname, b : item.lastname, resultlist: 'cuck'});
        //}
        //else
        //{
        //    res.render(('homepage2'),{a : item.firstname, b : item.lastname, resultlist: 'cuck'});
        //    data.save();
        //}
    }
    else{
        res.render('register', {
            title: 'Incorrect Values', cuck: 'Ya messed up'
            , success: false, errors: req.session.errors
        });
    }
});
//ADDED: Session information
router.get('/account', function (req, res, next) {
    var sess = req.session;
    var userData = sess.userDat;

    if(sess.logged) {
        var bday = new Date (userData.birthday).toUTCString();
        console.log(bday);
        res.render('account', {
            user: sess.username,
            title: 'Church Centre',
            firstname: userData.firstname,
            lastname: userData.lastname,
            dob: bday,
            email: userData.email,
            ph1: userData.phonenumber,
            ph2: userData.phonenumber2
        });
    }
    else {
        res.redirect('localhost:3000')
    }
});

//post page for child registration
router.post('/registerchild', function (req, res, next) {
    var sess = req.session;
    var userData = sess.userDat;

    var item = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        birthday: req.body.birthday,
        grade: req.body.grade
    };

    if(sess.logged) {
        console.log(userData.username);
            req.check('lastname', 'Invalid last name').isLength({min: 2});
            req.check('firstname', 'Invalid first name').isLength({min: 4});
            var errors = req.validationErrors();
            if (!errors) {
                var data = new Child(item);
                data.save(function(err, child) {
                        var child_id = child.id;
                        userData.children._id.update(child_id)
                    }
                );

                res.render('account');
            }
            else {
                res.render('registerchild',
                {
                    title: 'Incorrect Values', cuck: 'Ya messed up'
                    , success: false, errors: req.session.errors
                });
            }
        }
        else {
            console.error("User not logged in or session cannot retrieve user information");
    }
});

//note '/submit' is identicial to in the index.hbs file
//ADDED: SESS DATA
router.post('/login', function(req, res, next) {
    //form validation etc
    var item = {
        username: req.body.username,
        password: req.body.password
    };
    User.find({username : item.username, password : item.password}).then(function(doc){
        if(doc < 1){
            console.error('no login exists');
            res.render('login', {
                title: 'First last name combo doesnt exist', cuck: 'Ya messed up'
                , success: false, errors: req.session.errors
            });
        }
        else {
            var sessData = req.session;
            sessData.logged = true;
            sessData.username = doc[0].username;
            sessData.userDat = doc[0];
            console.log(sessData.userDat.email);
            //res.render('homepage2', {user: sessData.username, a: doc[0]._doc.username, b: doc[0]._doc.password, resultlist: doc[0]._doc._id});
            res.redirect('/homepage2');
        }
    });
});

//note '/submit' is identicial to in the index.hbs file
router.post('/index', function(req, res, next) {
    //form validation etc
    var item = {
        username: req.body.username,
        password: req.body.password
    };
    User.find({username : item.username, password : item.password}).then(function(doc){
        if(doc < 1){
            console.error('no login exists');
            res.render('index', {
                title: 'First last name combo doesnt exist', cuck: 'Ya messed up'
                , success: false, errors: req.session.errors
            });
        }
        else {

            res.render('homepage2', {a: doc[0]._doc.username, b: doc[0]._doc.password, resultlist: doc[0]._doc._id});
        }
    });
});

module.exports = mongoose.model("User", userDataSchema);
module.exports = mongoose.model("Child", childDataSchema);
module.exports = router;
