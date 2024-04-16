DROP TABLE IF EXISTS users;
CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
);

DROP TABLE IF EXISTS recommendations;
CREATE TABLE recommendations(
    id SERIAL PRIMARY KEY,  -- Unique identifier
    track_name VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255) NOT NULL,
    album_image_url VARCHAR(1000) NOT NULL,
    track_uri VARCHAR(255) NOT NULL,
    recommended_for VARCHAR(50),  -- Foreign key referencing user ID
    genreInput VARCHAR(255),
    FOREIGN KEY (recommended_for) REFERENCES users(username) -- Link recommendations to users
);