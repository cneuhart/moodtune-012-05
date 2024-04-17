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

DROP TABLE IF EXISTS moods;
CREATE TABLE moods(
    -- Let's see how to connect
    mid INT PRIMARY KEY,
    mood VARCHAR(255) NOT NULL,
    -- related_genre VARCHAR(255) NOT NULL,
    -- FOREIGN KEY (related_genre) REFRENCES genres()
);

DROP TABLE IF EXISTS genres;
CREATE TABLE genres(
    gid INT PRIMARY KEY,
    genre VARCHAR(255) NOT NULL,
    -- related_moods VARCHAR(255) NOT NULL,
    -- FOREIGN KEY (related_genre) REFRENCES genres()
);

-- connection -2foeigh keys, -one is genre id, one is mood id
--left merge connect to moods, then left merge w/genres
DROP TABLE IF EXISTS connect;
CREATE TABLE connect(
    -- id INT PRIMARY KEY,
    -- related_genre VARCHAR(255) NOT NULL,
    FOREIGN KEY (gid) REFRENCES genres()
    FOREIGN KEY (mid) REFRENCES moods()
);


