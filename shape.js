const mongoose = require('mongoose');

const ShapeSchema = new mongoose.Schema({
    name:  String
}, { collection: 'shapes' });

const CircleSchema = new mongoose.Schema({
    diameter: Number
});

const RectangleSchema = new mongoose.Schema({
    width: Number,
    height: Number,
});

const Shape = mongoose.model('shape', ShapeSchema);
const Circle = Shape.discriminator('circle', CircleSchema);
const Rectangle = Shape.discriminator('rectangle', RectangleSchema);

module.exports = {
    Shape,
    Circle,
    Rectangle,
};
