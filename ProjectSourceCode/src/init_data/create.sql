DROP TABLE IF EXISTS users;
CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
);

DROP TABLE IF EXISTS recommendations;
CREATE TABLE recommendations(
    id INT PRIMARY KEY,  -- Unique identifier
    track_name VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255) NOT NULL,
    album_image_url VARCHAR(1000) NOT NULL,
    recommended_for INT,  -- Foreign key referencing user ID
    FOREIGN KEY (recommended_for) REFERENCES users(id) -- Link recommendations to users
);