var mongoose = require('mongoose');

//check if entry is unique upper and lowerclass is the same
var uniqueValidator = require('mongoose-unique-validator');

/*adds constraints and validation */
/* Represents a lake  */
var lakeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, uniqueCaseInsensitive: true },

    //serverside validation

    //update date and time by putting them both is a list

runs: [ {
        date: { type: Date, default: Date.now, validate: {
            validator : function(date) {
                //return false if date is in the future
                //custom mongoose validation
                return (date.getTime() < Date.now()) ; //time is less than now, in past
            }, message: '{VALUE} is not a valid sighting date. Date must be in the past'
        }},
        time: Number
}]
});

var Lake = mongoose.model('Lake', lakeSchema);
lakeSchema.plugin(uniqueValidator);

module.exports = Lake;