DROP TABLE IF EXISTS users;
CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
);

DROP TABLE IF EXISTS recommendations;
CREATE TABLE recommendations(
    id SERIAL PRIMARY KEY,  -- Unique identifier
    generationID INT, -- ID per group of 10 songs generated
    track_name VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255) NOT NULL,
    artist_uri VARCHAR(255) NOT NULL,
    artist_image_url VARCHAR(255) NOT NULL,
    album_image_url VARCHAR(1000) NOT NULL,
    track_uri VARCHAR(255) NOT NULL,
    recommended_for VARCHAR(50),  -- Foreign key referencing user ID
    genreInput VARCHAR(255),
    FOREIGN KEY (recommended_for) REFERENCES users(username) -- Link recommendations to users
);

DROP TABLE IF EXISTS moods;
CREATE TABLE moods(
    -- Let's see how to connect
    id INT PRIMARY KEY,
    mood VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS genres;
CREATE TABLE genres(
    id INT PRIMARY KEY,
    genre VARCHAR(255) NOT NULL
);

-- connection -2foeigh keys, -one is genre id, one is mood id
--left merge connect to moods, then left merge w/genres
DROP TABLE IF EXISTS wgConnect;
CREATE TABLE wgConnect(
    genre_id INT,
    mood_id INT,
    FOREIGN KEY (genre_id) REFERENCES genres(id),
    FOREIGN KEY (mood_id) REFERENCES moods(id),
    PRIMARY KEY (genre_id,mood_id)
);

