var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var theEarth = (function () {
    var earthRadius = 6371;
    var getDistanceFromRads = function (rads) {
      return parseFloat(rads * earthRadius);
    };
    var getRadsFromDistance = function (distance) {
      return parseFloat(distance / earthRadius);
    };
    return {
        getDistanceFromRads: getDistanceFromRads,
        getRadsFromDistance: getRadsFromDistance
    }
})();

var sendJsonResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

//GET
module.exports.locationsReadOne = function (req, res) {
    if (req.params && req.params.locationId) {
        Loc.findById(req.params.locationId).exec(function (err, location) {
            if (!location) {
                return sendJsonResponse(res, 404, {
                    'message': 'locationId not found'
                });
            } else if (err) {
                return sendJsonResponse(res, 404, err);
            }
            sendJsonResponse(res, 200, location);
        });
    } else {
        sendJsonResponse(res, 404, {
           "message": "No locationId in request"
        });
    }
};

module.exports.locationsListByDistance = function (req, res) {
    var long = parseFloat(req.query.long);
    var lat = parseFloat(req.query.lat);
    var point = {
        type: "Point",
        coordinates: [long, lat]
    };
    var geoOptions = {
        spherical: true,
        maxDistance: theEarth.getRadsFromDistance(20),
        num: 10
    };
    if (!long || !lat) {
        return sendJsonResponse(res, 404, {
            "message": "long and lat query parameters are required"
        });
    }
    Loc.geoNear(point, geoOptions, function (err, results, stats) {
        var locations = [];
        if (err) {
            sendJsonResponse(res, 404, err);
        } else {
            results.forEach(function (doc) {
               locations.push({
                   distance: theEarth.getDistanceFromRads(doc.dis),
                   name: doc.obj.name,
                   address: doc.obj.address,
                   rating: doc.obj.rating,
                   facilities: doc.obj.facilities,
                   _id: doc.obj._id
               });
            });
            sendJsonResponse(res, 200, locations);
        }
    });
};


//POST
module.exports.locationsCreate = function () {
  Loc.create({
      name: req.body.name,
      address: req.body.address,
      facilities: req.body.facilities.split(','),
      coords: [parseFloat(req.body.long), parseFloat(req.body.lat)],
      openingTimes: [
          {
              days: req.body.days1,
              opening: req.body.opening1,
              closing: req.body.closing1,
              closed: req.body.closed1
          },
          {
              days: req.body.days2,
              opening: req.body.opening2,
              closing: req.body.closing2,
              closed: req.body.closed2
          }
      ]
  }, function (err, location) {
      if (err) {
          sendJsonResponse(res, 400, err);
      } else {
          sendJsonResponse(res, 201, location);
      }
  });
};


//PUT
module.exports.locationsUpdateOne = function (req, res) {
    if (!req.params.locationId) {
        return sendJsonResponse(res, 404, {
            "message": "Not found, locationID is required"
        });
    }
    Loc
        .findById(req.params.locationId)
        .select('-reviews -ratings')
        .exec(function (err, location) {
            if (!location) {
                 return sendJsonResponse(res, 404, {
                    "message": "locationId not found"
                });
            } else if (err) {
                return sendJsonResponse(res, 400, err);
            }
            location.name = req.body.name;
            location.address = req.body.address;
            location.facilities = req.body.facilities.split(',');
            location.coords = [parseFloat(req.body.long), parseFloat(req.body.lat)];
            location.openingTimes = [
                {
                    days: req.body.days1,
                    opening: req.body.opening1,
                    closing: req.body.closing1,
                    closed: req.body.closed1
                },
                {
                    days: req.body.days2,
                    opening: req.body.opening2,
                    closing: req.body.closing2,
                    closed: req.body.closed2
                }
            ];

            location.save(function (err, location) {
                if (err) {
                    sendJsonResponse(res, 404, err);
                } else {
                    sendJsonResponse(res, 200, location);
                }
            });
        });
};


//DELETE
module.exports.locationsDeleteOne = function (req, res) {
    var locationId = req.params.locationId;
    if (locationId) {
        Loc
            .findByIdAndRemove(locationId)
            .exec(function (err, location) {
                if (err) {
                    return sendJsonResponse(res, 404, err);
                }
                sendJsonResponse(res, 204, null);
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No locationId"
        });
    }
};