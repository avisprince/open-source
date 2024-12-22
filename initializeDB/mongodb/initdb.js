db = db.getSiblingDB("mongo1");
db.createCollection("users");

db.users.insertMany([
  {
    name: "avi prince",
    email: "avisprince@gmail.com",
  },
  {
    name: "Pete Desiderio",
    email: "pdesider@gmail.com",
  },
]);
