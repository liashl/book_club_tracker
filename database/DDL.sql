-- developer: Lia Launtz
-- bookclub builder app
-- April-June, 2026

DROP PROCEDURE IF EXISTS load_bookclub_db;

DELIMITER //
CREATE PROCEDURE load_bookclub_db()
BEGIN

SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;

START TRANSACTION;

DROP TABLE IF EXISTS Clubs;
DROP TABLE IF EXISTS Readers;
DROP TABLE IF EXISTS ClubReaders;
DROP TABLE IF EXISTS ClubAdmins;
DROP TABLE IF EXISTS Suggestions;
DROP TABLE IF EXISTS CurrentReads;
DROP TABLE IF EXISTS Milestones;
DROP TABLE IF EXISTS ReadMilestones;
DROP TABLE IF EXISTS Changes;

-- Create Table: Clubs
CREATE TABLE Clubs (
	clubID INT AUTO_INCREMENT UNIQUE NOT NULL,
    clubName VARCHAR(30),
    PRIMARY KEY (clubID)
);

INSERT INTO Clubs (clubName) VALUES
	('Knights Radiant'),
    ('Scholars');
    
-- Create Table: Readers
CREATE TABLE Readers (
	readerID INT AUTO_INCREMENT UNIQUE NOT NULL,
    readerAlias VARCHAR(30),
    PRIMARY KEY (readerID)
);

-- test data for Readers
INSERT INTO Readers (readerAlias) VALUES
	('Shallan'),
    ('Jasnah'),
    ('Navani'),
    ('Masha');

-- Create Table: ClubReaders
CREATE TABLE ClubReaders (
	clubReaderID INT AUTO_INCREMENT UNIQUE NOT NULL,
    clubID INT NOT NULL,
    readerID INT NOT NULL,
    PRIMARY KEY (clubReaderID),
    CONSTRAINT fk_club FOREIGN KEY (clubID)
		REFERENCES Clubs(clubID) ON DELETE CASCADE,
	CONSTRAINT fk_read FOREIGN KEY (readerID)
		REFERENCES Readers(readerID) ON DELETE CASCADE
);

-- test data for ClubReaders
INSERT INTO ClubReaders (clubID, readerID) VALUES
	(1, 1),
    (1, 2),
    (1, 3),
    (2, 2),
    (2, 3),
    (2, 4);

-- Create Table: ClubAdmins
CREATE TABLE ClubAdmins (
	clubAdminID INT AUTO_INCREMENT UNIQUE NOT NULL,
    clubReaderID INT,
    PRIMARY KEY (clubAdminID),
    CONSTRAINT fk_clubread FOREIGN KEY (clubReaderID)
		REFERENCES ClubReaders(clubReaderID) ON DELETE CASCADE
);

-- test data for ClubAdmins
INSERT INTO ClubAdmins (clubReaderID) VALUES (1), (4);

-- Create Table: Suggestions
CREATE TABLE Suggestions (
	suggestionID INT AUTO_INCREMENT UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(100) NOT NULL,
    blurb VARCHAR(511),
    clubReaderID INT,
    isActive TINYINT (1) DEFAULT 1,
    priority INT DEFAULT NULL,
	PRIMARY KEY (suggestionID),
    CONSTRAINT fk_readsugg FOREIGN KEY (clubReaderID)
		REFERENCES ClubReaders(clubReaderID) ON DELETE CASCADE
);

-- test data for suggestions
INSERT INTO Suggestions (title, author, blurb, clubReaderID) VALUES
	('Oathbringer', 'Dalinar', 'My Glory and My Shame is a banger of a subtitle', 2),
    ('The Way of Kings', 'Nohadon', 'Contains the most important words you will ever say... somewhere', 3),
    ('Words of Radiance', 'Some ancient scholar', 'Useful when trying to refound the Lost Radiants', 1),
    ('Knights of Wind and Truth', 'Masha-Daughter_Shaliv', 'We should really figure out what happened in Shinovar', 4),
    ('Rhythm of War','Navani and Raboniel', 'Important for the unfolding anti-light arms race', 3);

-- Create Table: CurrentReads
CREATE TABLE CurrentReads (
	readID INT AUTO_INCREMENT UNIQUE NOT NULL,
    clubID INT,
    suggestionID INT,
    isActive TINYINT(1) DEFAULT 1,
    PRIMARY KEY (readID),
    CONSTRAINT fk_rdclub FOREIGN KEY (clubID)
		REFERENCES Clubs(clubID) ON DELETE CASCADE,
	CONSTRAINT fk_rdsugg FOREIGN KEY (suggestionID)
		REFERENCES Suggestions(suggestionID) ON DELETE CASCADE
);

-- test values for CurrentReads
INSERT INTO CurrentReads (clubID, suggestionID, isActive) VALUES (1, 3, 1), (2, 5, 1);

-- Create Table: Milestones
CREATE TABLE Milestones (
	milestoneID INT AUTO_INCREMENT UNIQUE NOT NULL,
    milestoneDesc VARCHAR(30),
    milestoneBlurb VARCHAR(255),
    PRIMARY KEY (milestoneID)
);

-- test data for milestones
INSERT INTO Milestones (milestoneDesc, milestoneBlurb) VALUES
	('start', 'We start reading our book. Join us!'),
    ('week 2 check-in', 'You should have read chapters 2 and 3'),
    ('Club meeting', 'Come join us for a discussion!');


-- Create Table: ReadMilestones
CREATE TABLE ReadMilestones (
	readMilestoneID INT AUTO_INCREMENT UNIQUE NOT NULL,
    readID INT,
    milestoneID INT,
    readMilestoneDate DATE,
    PRIMARY KEY (readMilestoneID),
    CONSTRAINT fk_miles FOREIGN KEY (milestoneID)
		REFERENCES Milestones(milestoneID) ON DELETE CASCADE,
	CONSTRAINT fk_mread FOREIGN KEY (readID)
		REFERENCES CurrentReads(readID) ON DELETE CASCADE
);

-- test data for ReadMilestones
INSERT INTO ReadMilestones (readID, milestoneID, readMileStoneDate) VALUES
	(1, 1, '2026-04-28'),
    (2, 1, '2026-04-28');

CREATE TABLE Changes (
    changeID INT AUTO_INCREMENT UNIQUE NOT NULL,
    changeDate DATETIME NOT NULL,
    suggestionID INT NOT NULL,
    changeAmount INT NOT NULL,
    PRIMARY KEY (changeID),
    CONSTRAINT fk_sugg FOREIGN KEY (suggestionID)
        REFERENCES Suggestions(suggestionID)
        ON DELETE CASCADE
);


SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
END //
DELIMITER ;

call load_bookclub_db();
SELECT * FROM Suggestions;