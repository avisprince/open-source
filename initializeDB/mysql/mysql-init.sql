Create database test; 
CREATE TABLE test.Table2 (
  id int NOT NULL AUTO_INCREMENT,
  firstName varchar(100) NULL,
  lastName varchar(100) NULL,
  gender varchar(10) NULL,
  job_description varchar(100) NULL,
  PRIMARY KEY (id)
); 

INSERT INTO test.Table2 (firstName, lastName, gender, job_description) values ("Avi", "Prince", "Male", "Full Stack Software Engineer");
INSERT INTO test.Table2 (firstName, lastName, gender, job_description) values ("Pete", "Desiderio", "Male", "Full Stack Software Engineer"); 

