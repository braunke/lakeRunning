var express = require('express');
var router = express.Router();

var Lake = require('../models/lake');
/* GET home page. */

router.get('/', function(req, res, next) {
  Lake.find(function(err, lakes){
    if (err) {
      return next(err);
    }
      res.render('index', { lakes: lakes });
  })
});
//post to home page handle submit form
router.post('/', function(req, res, next){

    // Make a copy of non-blank fields from req.body

    var lakeData = {};

    for (var field in req.body) {
        if (req.body[field]) {      // Empty strings are false
            lakeData[field] = req.body[field];
        }
    }
    var date = {date: req.body.dateSeen,
               time: req.body.time}
    lakeData.runs = [ date ];
    delete(lakeData.dateSeen);
    delete(lakeData.time);
    var lake = Lake(lakeData);  //Create new Lake from req.body
    lake.save(function(err, newlake){

        if (err) {

            if (err.name == 'ValidationError') {

                //Loop over error messages and add the message to messages array
                var messages = [];
                for (var err_name in err.errors) {
                    messages.push(err.errors[err_name].message);
                }

                req.flash('error', messages);
                return res.redirect('/')
            }

            //For other errors we have not anticipated, send to generic error handler
            return next(err);
        }


        return res.redirect('/')
    })
});
router.post('/addDate', function(req, res, next){
//checks to make sure both date and time are entered
    if (!req.body.dateSeen || !req.body.time) {
        req.flash('error', 'Please provide a date and time for your new run ' + req.body.name);
        return res.redirect('/');
    }

    // Find the lake with the given ID, and add this new date to the datesSeen array
    Lake.findById( req.body._id, function(err, lake) {
//checks for errors
        if (err) {
            return next(err);
        }

        if (!lake) {
            res.statusCode = 404;
            return next(new Error('Not found, lake with _id ' + req.body._id));
        }



        var run = {
            date: req.body.dateSeen,
            time: req.body.time
        };
        lake.runs.push(run);  // Add new date to runs array



        // And sort datesSeen
        lake.runs.sort(function(a, b) {
            if (a.time  < b.time) { return 1;  }
            if (a.time > b.time) { return -1; }
            return 0;
        });
        lake.save(function(err){
            if (err) {
                if (err.name == 'ValidationError') {
                    //Loop over error messages and add the message to messages array
                    var messages = [];
                    for (var err_name in err.errors) {
                        messages.push(err.errors[err_name].message);
                    }
                    req.flash('error', messages);
                    return res.redirect('/')
                }
                return next(err);   // For all other errors
            }

            return res.redirect('/');  //If saved successfully, redirect to main page
        })
    });
});
router.post('/deleteLake', function(req, res, next){

    var id = req.body._id;
    Lake.findByIdAndRemove(id, function(err){
        if (err){
            return next(err);
        }
        req.flash('info', 'Deleted');
        return res.redirect('/')
    })
});
//separate page for each lake
router.get('/details/:id', function(req, res, next) {
    Lake.findById( req.params.id, function(err, lake) {
        if (err) {
            return next(err);  // 500 error
        }
        if (!lake) {
            return next();  // Creates a 404 error
        }

        res.render('lakeDetails', { lake: lake } );
    });
});



module.exports = router;
