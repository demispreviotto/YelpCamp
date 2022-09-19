const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '631909ebdc8349118cc93c71',//your author ID
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam, quod. Voluptate officia nihil, quos repudiandae quae nostrum aperiam neque quaerat natus voluptates quo animi deleniti est maxime quis, impedit rem.',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/d98ebb3866bffe843fd25967e3256e025/image/upload/v1662838661/YelpCamp/jpu9e88jx4hh1cv330mm.jpg',
                    filename: 'YelpCamp/jpu9e88jx4hh1cv330mm',
                },
                {
                    url: 'https://res.cloudinary.com/d98ebb3866bffe843fd25967e3256e025/image/upload/v1662838662/YelpCamp/q5xjncm8ukbhjshjyvki.jpg',
                    filename: 'YelpCamp/q5xjncm8ukbhjshjyvki',
                }
            ],
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})