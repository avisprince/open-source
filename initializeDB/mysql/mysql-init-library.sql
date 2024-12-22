CREATE DATABASE IF NOT EXISTS library;
USE library;
CREATE TABLE books (
    id INT PRIMARY KEY,
    title VARCHAR(255),
    author_id INT,
    isbn VARCHAR(20),
    publication_date DATE
);

CREATE TABLE authors (
    id INT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255)
);

CREATE TABLE checkouts (
    id INT PRIMARY KEY,
    user_id INT,
    book_id INT,
    checkout_date DATE,
    due_date DATE,
    return_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

INSERT INTO authors (id, name)
VALUES 
    (1, 'J.K. Rowling'),
    (2, 'George R.R. Martin'),
    (3, 'Stephen King'),
    (4, 'Harper Lee');

INSERT INTO books (id, title, author_id, isbn, publication_date)
VALUES
    (1, "Harry Potter and the Philosopher's Stone", 1, '9780747532743', '1997-06-26'),
    (2, 'A Game of Thrones', 2, '9780553381689', '1996-08-01'),
    (3, 'The Shining', 3, '9780307743657', '1977-01-28'),
    (4, 'To Kill a Mockingbird', 4, '9780446310789', '1960-07-11');

INSERT INTO users (id, name, email)
VALUES
    (1, 'John Doe', 'johndoe@example.com'),
    (2, 'Jane Doe', 'janedoe@example.com'),
    (3, 'Bob Smith', 'bobsmith@example.com');

INSERT INTO checkouts (id, user_id, book_id, checkout_date, due_date, return_date)
VALUES
    (1, 1, 1, '2022-01-01', '2022-01-15', '2022-01-12'),
    (2, 1, 2, '2022-02-01', '2022-02-15', NULL),
    (3, 2, 1, '2022-02-15', '2022-03-01', NULL),
    (4, 2, 4, '2022-03-01', '2022-03-15', NULL),
    (5, 3, 3, '2022-03-15', '2022-03-29', NULL);
