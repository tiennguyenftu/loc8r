/* GET Home page. */
module.exports.homeList = function(req, res) {
    res.render('location-list', { title: 'Home' });
};

/* GET Location Info page. */
module.exports.locationInfo = function(req, res) {
    res.render('location-info', { title: 'Location info' });
};

/* GET  page. */
module.exports.addReview = function(req, res) {
    res.render('location-review-form', { title: 'Add review' });
};