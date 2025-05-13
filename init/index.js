const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// const MONGO_URL =process.env.ATLASDB_URL
// async function main() {
//     await mongoose.connect(MONGO_URL)
// }


async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
}

main()
.then(() => {
    console.log("Connected to db");
})
.catch((err) => {
    console.log(err);
});

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner:"67ff6a316e91ffd22d7bf0fd"}));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
};

initDB();