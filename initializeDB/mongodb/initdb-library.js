db = db.getSiblingDB("library");

// create authors collection with sample data
db.createCollection("authors");
db.authors.insertMany([
  { name: "Jane Austen", nationality: "English" },
  { name: "Fyodor Dostoevsky", nationality: "Russian" },
  { name: "Harper Lee", nationality: "American" },
]);

// create books collection with sample data
db.createCollection("books");
db.books.insertMany([
  { title: "Pride and Prejudice", author: "Jane Austen", publishedYear: 1813 },
  { title: "Emma", author: "Jane Austen", publishedYear: 1815 },
  {
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    publishedYear: 1866,
  },
  {
    title: "The Brothers Karamazov",
    author: "Fyodor Dostoevsky",
    publishedYear: 1880,
  },
  { title: "To Kill a Mockingbird", author: "Harper Lee", publishedYear: 1960 },
]);

// create checkouts collection with sample data
db.createCollection("checkouts");
db.checkouts.insertMany([
  {
    book: "Pride and Prejudice",
    checkoutDate: new Date("2022-03-01"),
    returnDate: new Date("2022-03-10"),
  },
  {
    book: "The Brothers Karamazov",
    checkoutDate: new Date("2022-03-05"),
    returnDate: new Date("2022-03-15"),
  },
]);
