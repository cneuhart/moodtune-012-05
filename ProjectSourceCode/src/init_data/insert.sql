INSERT INTO moods (mid, mood)
VALUES(1, 'happy'), (2, 'calm'), (3, 'sad'), (4, 'angry'), (5,'party'), 
(6,'laugh'),(7,'rock')

INSERT INTO genres (gid, genre)
VALUES(1, 'acoustic'), (2, 'afrobeat'), (3, 'alt-rock'), (4, 'alternative'),
(5, 'ambient' ), (6, 'anime'), (7, 'black-metal' ), (8, 'bluegrass'), 
(9, 'blues' ), (10, 'bossanova' ), (11, 'brazil'), (12, 'breakbeat' ), 
(13, 'british' ), (14, 'cantopop'), (15, 'chicago-house'), (16, 'children'), 
(17, 'chill'), (18, 'classical' ), (19, 'club'), (20, 'comedy'), 
(21, 'country'), (22, 'dance'), (23, 'dancehall' ), (24, 'death-metal'),
(25, 'deep-house' ), (26, 'detroit-techno'), (27, 'disco' ), (28, 'disney'), 
(29, 'drum-and-bass'), (30, 'dub' ), (31, 'dubstep'), (32, 'edm'), 
(33, 'electro'), (34, 'electronic'), (35, 'emo'), (36, 'folk'), 
(37, 'forro'), (38, 'french'), (39, 'funk'), (40, 'garage'), (41, 'german'),
(42, 'gospel'), (43, 'goth'), (44, 'grindcore'), (45, 'groove'), 
(46, 'grunge'), (47, 'guitar'), (48, 'happy'), (49, 'hard-rock'), 
(50, 'hardcore'), (51, 'hardstyle'), (52, 'heavy-metal'), (53, 'hip-hop'),
(54, 'holidays'), (55, 'honky-tonk'), (56, 'house'), (57, 'idm'),
(58, 'indian'), (59, 'indie'), (60, 'indie-pop'), (70, 'industrial'), 
(71, 'iranian'), (72, 'j-dance'), (73, 'j-idol'), (74, 'j-pop'), (75, 'j-rock'),
(76, 'jazz'), (77, 'k-pop'), (78, 'kids'), (79, 'latin'), (80, 'latino'),
(81, 'malay'), (82, 'mandopop'), (83, 'metal'), (84, 'metal-misc'), 
(85, 'metalcore'), (86, 'minimal-techno'), (87, 'movies'), (88, 'mhb'),
(89, 'new-age'), (90, 'new-release'), (91, 'opera'), (92, 'pagode'), (93, 'party'),
(94, 'philippines-opm'), (95, 'piano'), (96, 'pop'), (97, 'pop-film'),
(98, 'post-dubstep'), (99, 'power-pop'), (100, 'progressive-house'),
(101, 'psych-rock'), (102, 'punk'), (103, 'punk-rock'),(104, 'r-n-b'),
(105, 'rainy-day'),(106, 'reggae'),(107, 'reggaeton'),(108, 'road-trip'),
(109, 'rock'),(110, 'rock-n-roll'),(111, 'rockabilly'),(112, 'romance'),
(113, 'sad'),(114, 'salsa'),(115, 'samba'),(116, 'sertanejo'),(117, 'show-tunes'),
(118, 'singer-songwriter'),(119, 'ska'),(120, 'sleep'),(121, 'songwriter'),
(122, 'soul'),(123, 'soundtracks'),(124, 'spanish'),(125, 'study'),(126, 'summer'),
(127, 'swedish'),(128, 'synth-pop'),(129, 'tango'),(130, 'techno'),(131, 'trance'),
(132, 'trip-hop'),(133, 'turkish'),(134, 'work-out'),(135, 'world-music')

INSERT INTO connect (gid, mid)
VALUES (1,2),  -- acoustic
(19,5), -- club
(20, 1), -- comedy
(113,3), --sad
(120, 2), --sleep
(125, 2) --study