DROP TABLE IF EXISTS users;
CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    refreshToken CHAR(60)
);

DROP TABLE IF EXISTS artists;
CREATE TABLE artists(
    artistID SERIAL PRIMARY KEY,
    name VARCHAR(50),
    followers INT,
    imageURL VARCHAR(60),
    CONSTRAINT fk_username FOREIGN KEY (username) REFERENCES users(username)
);

DROP TABLE IF EXISTS genres;
CREATE TABLE artists(
    genreID SERIAL PRIMARY KEY,
    genre VARCHAR(20),
);

DROP TABLE IF EXISTS artistsToGenres;
CREATE TABLE artists(
    CONSTRAINT fk_genreID FOREIGN KEY (genreID) REFERENCES genres(genreID),
    CONSTRAINT fk_artistID FOREIGN KEY (artistID) REFERENCES artists(artistID)
);