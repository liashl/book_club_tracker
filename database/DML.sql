-- developer: Lia Launtz
-- bookclub builder app
-- April-June, 2026

call load_bookclub_db();

-- select a suggestion by suggestionID
SET @testSug = 1;
SELECT title, author, blurb FROM Suggestions WHERE suggestionID = @testSug;

-- select all readers in a club, giving their name, the club name, and their admin status
SET @testclub = 2;
SELECT Readers.readerAlias, clubs.ClubName, IF(clubAdminID IS NOT NULL, 1, 0) as isAdmin FROM Readers
	LEFT JOIN ClubReaders ON Readers.readerID = ClubReaders.readerID
    LEFT JOIN Clubs ON ClubReaders.clubID = Clubs.clubID
    LEFT JOIN ClubAdmins ON ClubAdmins.clubReaderID = ClubReaders.clubReaderID
    WHERE ClubReaders.clubID = @testClub
    ORDER BY readerAlias ASC;

-- find out if a club has an admin
SELECT Readers.readerAlias, clubs.ClubName, IF(clubAdminID IS NOT NULL, 1, 0) as isAdmin FROM Readers
	LEFT JOIN ClubReaders ON Readers.readerID = ClubReaders.readerID
    LEFT JOIN Clubs ON ClubReaders.clubID = Clubs.clubID
    LEFT JOIN ClubAdmins ON ClubAdmins.clubReaderID = ClubReaders.clubReaderID
    WHERE ClubReaders.clubID = @testClub AND clubAdminID IS NOT NULL;

-- find out if a reader is an admin in a club
SET @somereader = 3;
SELECT IF ((SELECT clubReaderID FROM ClubReaders WHERE clubID = @testClub AND readerID = @somereader) IN (SELECT clubReaderID from ClubAdmins), 1, 0);

-- select all active suggestions submitted by readers of a given club in ascending order of priority
SET @suggclub = 1;
SELECT Suggestions.title, Suggestions.author, Readers.readerAlias AS 'Suggested By', Suggestions.blurb, Suggestions.priority, Suggestions.isActive, Suggestions.suggestionID FROM Suggestions 
LEFT JOIN ClubReaders ON ClubReaders.clubReaderID = Suggestions.clubReaderID
LEFT JOIN Readers ON ClubReaders.readerID = Readers.readerID
WHERE ClubReaders.clubID = @suggclub AND Suggestions.isActive = 1
ORDER BY PRIORITY ASC;

-- select all active suggestions submitted by readers of a given club in random order
SELECT title, author, blurb, suggestionID, ROW_NUMBER() over(PARTITION BY clubID ORDER BY RAND()) as 'row' FROM (SELECT CLubReaders.clubID, Suggestions.suggestionID, Suggestions.title, Suggestions.author, Readers.readerAlias AS 'Suggested By', Suggestions.blurb FROM Suggestions 
LEFT JOIN ClubReaders ON ClubReaders.clubReaderID = Suggestions.clubReaderID
LEFT JOIN Readers ON ClubReaders.readerID = Readers.readerID
WHERE ClubReaders.clubID = @suggclub) as PossibleBooks;

-- **************** INSERT ******************

-- insert a new suggestion given readerID and clubID
SET @some_reader = 3;
SET @some_club = 1;
SET @insert_title = "Stormlight Handbook";
SET @insert_author = "Brotherwise Games";
SET @insert_blurb = "This book has tons of useful information!";
INSERT INTO Suggestions (title, author, blurb, clubReaderID) VALUES
	(@insert_title, @insert_author, @insert_blurb, 
					(SELECT clubReaderID FROM ClubReaders 
						WHERE ClubReaders.readerID = @some_reader 
							AND ClubReaders.clubID = @some_club));

-- insert new admin given clubID and readerID
INSERT INTO ClubAdmins (clubReaderID) VALUES 
	((SELECT clubReaderID FROM ClubReaders 
		WHERE ClubReaders.readerID = @some_reader AND clubReaders.clubID = @some_club));

-- add a new reader to club given readerID and clubID
SET @add_a_reader = 1;
SET @add_a_club = 2;
INSERT INTO ClubReaders (clubID, readerID) VALUES (@add_a_club, @add_a_reader);

-- add a new club
SET @new_club_name = "Ghostbloods";
INSERT INTO Clubs (clubName) VALUES (@new_club_name);

-- add a new reader
SET @new_reader_name = "Dalinar";
INSERT INTO Readers (readerAlias) VALUES (@new_reader_name);

-- add a new read by clubID and suggestionID
SET @add_club = 3;
SET @add_sugg = 3;
INSERT INTO CurrentReads (clubID, suggestionID) VALUES (@add_club, @add_sugg);

-- add a milestone
SET @newmilestone = "Discussion 1";
SET @newm_blurb = "Consider new discussion questions";
INSERT INTO Milestones (milestoneDesc, milestoneBlurb) 
	VALUES (@newmilestone, @newm_blurb);

-- add a milestone for a specific read by club and suggestion
set @mclub = 1;
set @msuggestion = 3;
INSERT INTO ReadMilestones (readID, milestoneID, readMilestoneDate)
	VALUES ((SELECT readID FROM CurrentReads WHERE clubID = @mclub AND suggestionID = 3), 3, '2026-05-01');

-- ****************** UPDATE ************************

-- update a reader by readerID
SET @newalias = "Veil";
SET @reader_to_update = 1;
UPDATE Readers SET readerAlias = @newalias WHERE readerID = @reader_to_update;

-- update a clubReader by clubReaderID
SET @creader_to_update = 6;
SET @newClubID = 2;
SET @newReaderID = 1;
UPDATE ClubReaders SET clubID = @newClubID, readerID = @newReaderID WHERE clubReaderID = @creader_to_update;

-- update a club by clubID
SET @update_club = 1;
SET @new_club_name = "Radiant Knights";
UPDATE Clubs SET clubName = @new_club_name WHERE clubID = @update_club;

-- update a currentRead (clubID, suggestionID) by currentReadID
SET @read_to_update = 1;
SET @input_club = 1;
SET @input_suggestionID = 2;
UPDATE CurrentReads SET clubID = @input_club, suggestionID = @input_suggestionID WHERE readID = @read_to_update;

-- flip CurrentRead to active/inactive by readID
SET @read_to_flip = 1;
UPDATE CurrentReads SET isActive = NOT isACTIVE where readID=@read_to_flip;

-- update a milestone by milestoneID
SET @milestone_to_change = 3;
SET @new_m_desc = "let's meet!!!";
SET @new_m_blurb = "Discussion time! Bring your ideas!";
UPDATE Milestones SET milestoneDesc = @new_m_desc, milestoneBlurb=@new_m_blurb WHERE milestoneID = @milestone_to_change;

-- update a read's milestone by readMilestoneID
set @someread = 1;
set @newreadID = 1;
set @newmID = 1;
set @newMilestoneDate = "2026-05-28";
UPDATE ReadMilestones SET readID=@newreadID, milestoneID=@newmID, readMilestoneDate = @newMilestoneDate 
	WHERE readMilestoneID = @someread;

-- update a suggestion title/author/blurb by suggestionID
SET @changeSugg = 4;
SET @insertTitle = 'new title';
SET @insertAuthor = 'new author';
SET @insertBlurb = 'new blurb';
UPDATE Suggestions SET title=@insertTitle, 
						author=@insertAuthor, 
                        blurb=@insertBlurb 
							WHERE Suggestions.suggestionID=@changeSugg;

-- update a priority by suggestionID
SET @changeSugg = 5;
SET @inputPriority = 1;
UPDATE Suggestions SET priority = @inputPriority WHERE Suggestions.suggestionID = @changeSugg;

-- flip isActive to its opposite by suggestionID
UPDATE Suggestions SET isActive = NOT isActive WHERE suggestionID = @changeSugg;

-- *************** DELETE *****************************

-- remove reader by readerID
SET @reader_to_delete = 1;
DELETE FROM Readers WHERE readerID = @reader_to_delete;

-- delete a suggestion by suggestionID
set @sugg_to_delete = 3;
DELETE FROM Suggestions WHERE suggestionID = @sugg_to_delete;

-- delete a club by clubID
SET @club_to_delete = 1;
DELETE FROM Clubs WHERE clubID = @club_to_delete;

-- delete an admin by adminID
SET @admin_to_delete = 1;
DELETE FROM ClubAdmins WHERE clubAdminID = @admin_to_delete;

-- remove clubReader by clubID and readerID
SET @readerID_to_delete = 2;
SET @club_to_delete = 1;
DELETE FROM clubReaders WHERE clubID = @club_to_delete AND readerID = @readerID_to_delete;

-- remove clubAdmin by readerID and clubID
DELETE FROM clubAdmins WHERE clubReaderID = (SELECT clubReaderID FROM clubReaders WHERE clubID=1 AND readerID=1);

-- remove milestone by milestoneID
SET @milestone_to_delete = 2;
DELETE FROM Milestones WHERE milestoneID=@milestone_to_delete;

-- delete a currentRead by readID
SET @read_to_delete = 2;
DELETE FROM CurrentReads WHERE readID = @read_to_delete;

-- delete from readMilestones by readMilestoneID
SET @readm_to_delete = 1;
DELETE FROM ReadMilestones WHERE readMilestoneID = @readm_to_delete;

-- delete inactive suggestions
DELETE FROM Suggestions WHERE isActive = 0;

-- delete inactive reads
DELETE FROM CurrentReads WHERE isActive = 0;

-- delete reader by readerID
SET @reader_to_delete = 1;
DELETE FROM Readers WHERE readerID = @reader_to_delete;



