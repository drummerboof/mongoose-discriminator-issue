const mongoose = require('mongoose');
mongoose.Promise = Promise;

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

// Our models are defined in a single place during application bootstrap
const Shape = mongoose.model('shape', ShapeSchema);
Shape.discriminator('circle', CircleSchema);
Shape.discriminator('rectangle', RectangleSchema);


// During the application run time, we have multiple connections
const primary = mongoose.connect('mongodb://localhost:27017/primary', { useMongoClient: true });
const secondary = mongoose.createConnection('mongodb://localhost:27017/secondary', { useMongoClient: true });

// We retrieve our connection scoped models using the model method on the connections.
// This works as expected for non discriminated models - the model is scoped to the connection.
const SecondaryShape = secondary.model('shape');
const PrimaryCircle = primary.model('circle');
const SecondaryCircle = secondary.model('circle');

async function demo () {

    // Create a circle in each database's shapes collection
    const primaryCircle = new PrimaryCircle({ name: 'one', diameter: 3 });
    const secondaryCircle = new SecondaryCircle({ name: 'two', diameter: 4 });
    await primaryCircle.save();
    await secondaryCircle.save();

    // Later use the base Shape model to retrieve the circle form the secondary database
    const foundSecondaryCircle = await SecondaryShape.findById(secondaryCircle._id);

    // The parent model db is correct (as expected)
    // Output: secondary
    console.log('Secondary shape database:', SecondaryShape.db.db.databaseName);

    // But the document instance returned has the primary connection as the db
    // The database instances the models are scoped to are out of sync
    // Any operations on this document are against the wrong connection
    // Output: primary
    console.log('Secondary circle database:', foundSecondaryCircle.db.db.databaseName);

    foundSecondaryCircle.set({ name: 'updated' });
    await foundSecondaryCircle.save();

    // Retrieve the updated circle
    const updatedSecondaryCircle = await SecondaryShape.findById(secondaryCircle._id);

    // The update is not applied
    // Output: two
    console.log('Secondary circle updated name:', updatedSecondaryCircle .name);

    process.exit();
}

demo();
