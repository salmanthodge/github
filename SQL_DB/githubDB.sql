create database githubdb;
use githubdb;

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username varchar(50) UNIQUE not null,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(256) NOT NULL,
    is_active boolean DEFAULT 1,
    otp varchar(10) default null,
    created_at datetime default current_timestamp,
    updated_at datetime on update current_timestamp
);

