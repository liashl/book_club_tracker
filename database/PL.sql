-- developer: Lia Launtz
-- bookclub builder app
-- April-June, 2026

-- ----------- reset ----------------------
DROP PROCEDURE IF EXISTS reset_all;
DELIMITER //

CREATE PROCEDURE reset_all()
BEGIN

-- definition is in DDL.SQL
CALL load_bookclub_db;

END //
DELIMITER ;
-- TO USE: call reset_all();

-- ---------- SELECT ---------------------

-- select a suggestion by suggestionID
DROP PROCEDURE IF EXISTS suggestion_get_by_id;
DELIMITER //

CREATE PROCEDURE suggestion_get_by_id(
	IN inputSuggestionID INT
)
BEGIN

SELECT title, author, blurb FROM Suggestions 
	WHERE suggestionID = inputSuggestionID;

END //
DELIMITER ;

-- select all readers in a club
-- output: reader's name, club' name, admin status (1 = True, 0 = False)
DROP PROCEDURE IF EXISTS readers_get_by_club;
DELIMITER //

CREATE PROCEDURE readers_get_by_club(
	IN input_club_id INT
)
BEGIN

SELECT Readers.readerAlias, clubs.ClubName, 
	IF(clubAdminID IS NOT NULL, 1, 0) as isAdmin FROM Readers
		LEFT JOIN ClubReaders ON Readers.readerID = ClubReaders.readerID
		LEFT JOIN Clubs ON ClubReaders.clubID = Clubs.clubID
		LEFT JOIN ClubAdmins ON ClubAdmins.clubReaderID = ClubReaders.clubReaderID
			WHERE ClubReaders.clubID = input_club_id
			ORDER BY readerAlias ASC;

END //
DELIMITER ;
-- TO USE: call readers_get_by_club(2);

-- select name of club's admin
-- input: clubID, variable to hold output
-- output: name of admin for club corresponding to clubID
DROP PROCEDURE IF EXISTS admin_get_by_club;
DELIMITER //
CREATE PROCEDURE admin_get_by_club(
	IN input_club_id INT,
    OUT adminName VARCHAR(30)
)
BEGIN

SELECT Readers.readerAlias into adminName FROM Readers
	LEFT JOIN ClubReaders ON Readers.readerID = ClubReaders.readerID
    LEFT JOIN Clubs ON ClubReaders.clubID = Clubs.clubID
    LEFT JOIN ClubAdmins ON ClubAdmins.clubReaderID = ClubReaders.clubReaderID
		WHERE ClubReaders.clubID = @testClub 
        AND clubAdminID IS NOT NULL;

END //
DELIMITER ;
-- TO USE: call admin_get_by_club(2, @outputadmin);

-- check if a reader is an admin given a club id
-- Input: readerID of reader, clubID of club
-- Output: isAdmin, holding 1 if true, 0 if false
DROP PROCEDURE IF EXISTS reader_get_admin_status_by_club;
DELIMITER //

CREATE PROCEDURE reader_get_admin_status_by_club(
	IN input_reader_id INT,
    IN input_club_id INT,
    OUT isAdmin TINYINT(1)
)
BEGIN

	SELECT IF ((SELECT clubReaderID FROM ClubReaders 
				WHERE clubID = input_club_id 
                AND readerID = input_reader_id) 
					IN (SELECT clubReaderID from ClubAdmins), 1, 0) INTO isAdmin;

END //
DELIMITER ;
-- TO USE: call reader_get_admin_status_by_club(1,1,@adminchecker);

-- select all active suggestions submitted by readers of a given club
-- return suggestions in ascending order of priority
DROP PROCEDURE IF EXISTS suggestions_get_by_priority;
DELIMITER //

CREATE PROCEDURE suggestions_get_by_priority(
	IN input_club_id INT
)
BEGIN

SELECT Suggestions.title, 
		Suggestions.author, 
		Readers.readerAlias AS 'Suggested By', 
        Suggestions.blurb, 
        Suggestions.priority, 
        Suggestions.isActive, 
        Suggestions.suggestionID FROM Suggestions 
			LEFT JOIN ClubReaders ON ClubReaders.clubReaderID = Suggestions.clubReaderID
			LEFT JOIN Readers ON ClubReaders.readerID = Readers.readerID
				WHERE ClubReaders.clubID = input_club_id AND Suggestions.isActive = 1
				ORDER BY PRIORITY ASC;

END //
DELIMITER ;
-- TO USE: call suggestions_get_by_priority(2);

-- select all active suggestions submitted by readers of a given club in random order
-- Input: clubID of club
DROP PROCEDURE IF EXISTS suggestions_get_random;
DELIMITER //

CREATE PROCEDURE suggestions_get_random(
	IN input_club_id INT
)
BEGIN

	SELECT title, author, blurb, suggestionID, 
			ROW_NUMBER() over(PARTITION BY clubID ORDER BY RAND()) as 'row' 
            FROM (SELECT ClubReaders.clubID, 
					Suggestions.suggestionID, 
                    Suggestions.title, 
                    Suggestions.author, 
                    Readers.readerAlias AS 'Suggested By', 
                    Suggestions.blurb FROM Suggestions 
						LEFT JOIN ClubReaders ON ClubReaders.clubReaderID = Suggestions.clubReaderID
						LEFT JOIN Readers ON ClubReaders.readerID = Readers.readerID
							WHERE ClubReaders.clubID = input_club_id) as PossibleBooks;

END //
DELIMITER ;
-- TO USE: call suggestions_get_random(1);

-- ***************** INSERT *********************

-- insert a new suggestion given readerID and clubID
-- Inputs: readerID of suggesting reader, clubID of club, title, author, text
-- Output: new suggestionID of suggestion
DROP PROCEDURE IF EXISTS suggestions_add_one;
DELIMITER //

CREATE PROCEDURE suggestions_add_one(
	IN input_reader_id INT,
    IN input_club_id INT,
    IN input_book_title VARCHAR(100),
    IN input_book_author VARCHAR(100),
    IN input_book_blurb VARCHAR(511),
    OUT output_suggestion INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		SELECT "Error: add suggestion" AS RESULT;
		ROLLBACK;
    END;

START TRANSACTION;

	INSERT INTO Suggestions (title, author, blurb, clubReaderID) VALUES
		(input_book_title, input_book_author, input_book_blurb, 
						(SELECT clubReaderID FROM ClubReaders 
							WHERE ClubReaders.readerID = input_reader_id 
								AND ClubReaders.clubID = input_club_id));

	SELECT last_insert_id() INTO output_suggestion;
	SELECT last_insert_id() AS new_id;

COMMIT;
END // 
DELIMITER ;
-- TO USE call suggestions_add_one(1, 1, "Stormlight Handbook", "Unknown author", "This has helpfully comprehensible information about surgebinding", @output_sugg_id);
-- SELECT @output_sugg_id;

-- insert new admin given clubID and readerID
-- Input: readerID of reader, clubID of club
-- Output: clubAdminID of new admin
DROP PROCEDURE IF EXISTS clubadmin_add_one;
DELIMITER //

CREATE PROCEDURE clubadmin_add_one(
	IN input_reader_id INT,
    IN input_club_id INT,
    OUT output_admin INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		SELECT "Error: add admin" as result;
		ROLLBACK;
	END;

START TRANSACTION;

	INSERT INTO ClubAdmins (clubReaderID) VALUES 
		((SELECT clubReaderID FROM ClubReaders 
			WHERE ClubReaders.readerID = input_reader_id AND clubReaders.clubID = input_club_id));
	
    SELECT last_insert_id() INTO output_admin;
	SELECT output_admin AS last_inserted;

COMMIT;
END //
DELIMITER ;
-- TO USE: CALL clubadmin_add_one(4, 2, @newadminID);

-- add a new reader to club given readerID and clubID
DROP PROCEDURE IF EXISTS clubreaders_add_one;
DELIMITER //

CREATE PROCEDURE clubreaders_add_one(
	IN input_reader_id INT,
    IN input_club_id INT,
    OUT output_clubreader INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		SELECT "Error: add clubReader" as result;
		ROLLBACK;
	END;
    
    START TRANSACTION;

	INSERT INTO ClubReaders (clubID, readerID) 
		VALUES (input_club_id, input_reader_id);

	SELECT last_insert_id() INTO output_clubreader;

	COMMIT;
END //
DELIMITER ;
-- TO USE: call clubreaders_add_one(2,1,@output_clubreader);
-- select @output_clubreader;

-- add a new club given the club name
DROP PROCEDURE IF EXISTS clubs_add_new;
DELIMITER //

CREATE PROCEDURE clubs_add_new(
	IN input_club_name VARCHAR(30),
    OUT output_club INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: add club" as result;
		ROLLBACK;
    END;
	
    START TRANSACTION;
    
		INSERT INTO Clubs (clubName) VALUES (input_club_name);
        SELECT LAST_INSERT_ID() INTO output_club;
    
    COMMIT;
END //
DELIMITER ;
-- TO USE: call clubs_add_new("Ghostbloods", @addedclub);
-- select @addedclub;

-- add a new reader
DROP PROCEDURE IF EXISTS readers_add_new;
DELIMITER //

CREATE PROCEDURE readers_add_new(
	IN input_reader_name VARCHAR(30),
    OUT output_reader_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: adding reader" as result;
		ROLLBACK;
    END;

	START TRANSACTION;
    
		INSERT INTO Readers (readerAlias) VALUES (input_reader_name);
        SELECT last_insert_id() INTO output_reader_id;
    
    COMMIT;
END //
DELIMITER ;
-- TO USE: call readers_add_new('Dalinar', @outputreaderid);
-- select @outputreaderid;

-- add a new read by clubID and suggestionID
DROP PROCEDURE IF EXISTS currentreads_add_new;
DELIMITER //

CREATE PROCEDURE currentreads_add_new(
	IN insert_club_id INT,
    IN insert_suggestion_id INT,
    OUT output_currentread_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		SELECT "Error: adding new CurrentRead" as result;
		ROLLBACK;
    END;

	START TRANSACTION;
    
		INSERT INTO CurrentReads (clubID, suggestionID) VALUES (insert_club_id, insert_suggestion_id);
		SELECT LAST_INSERT_ID() INTO output_currentread_id;
    
    COMMIT;
END //
DELIMITER ;
-- TO USE: call currentreads_add_new(3, 3, @newread);
-- select @newread;

-- add a milestone
DROP PROCEDURE IF EXISTS milestones_add_one;
DELIMITER // 

CREATE PROCEDURE milestones_add_one(
	IN insert_milestone_desc VARCHAR(30),
    IN insert_milestone_blurb VARCHAR(255),
    OUT output_milestone_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: add milestone" as result;
		ROLLBACK;
    END;

	START TRANSACTION;
    
		INSERT INTO Milestones (milestoneDesc, milestoneBlurb) 
			VALUES (insert_milestone_desc, insert_milestone_blurb);
            
		SELECT LAST_INSERT_ID() INTO output_milestone_id;
    
    COMMIT;
END // 
DELIMITER ;
-- TO USE: call milestones_add_one('Discussion 1', 'Consider new discussion questions', @output_milestone);
-- select @output_milestone;

-- add a milestone for a specific read by club and suggestion
DROP PROCEDURE IF EXISTS readmilestones_add_one;
DELIMITER //

CREATE PROCEDURE readmilestones_add_one(
	IN input_club_id INT,
	IN input_suggestion_id INT,
    IN input_milestone_id INT,
    IN input_milestone_date DATE,
    OUT output_readmilestone_id INT
)
BEGIN

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: add ReadMilestone" as result;
		ROLLBACK;
    END;

	START TRANSACTION;

		INSERT INTO ReadMilestones (readID, milestoneID, readMilestoneDate)
			VALUES ((SELECT readID FROM CurrentReads 
						WHERE clubID = input_club_id 
                        AND suggestionID = input_suggestion_id),
					input_milestone_id, input_milestone_date);
                    
		SELECT LAST_INSERT_ID() INTO output_readmilestone_id;

	COMMIT;
END //
DELIMITER ;
-- TO USE: CALL readmilestones_add_one(2, 3, 1, '2026-04-29', @outputreadmilestone);
-- SELECT @outputreadmilestone;

-- *************** UPDATE ************************

-- update a reader by readerID
DROP PROCEDURE IF EXISTS readers_update_by_id;
DELIMITER //

CREATE PROCEDURE readers_update_by_id(
	IN input_reader_alias VARCHAR(30),
    IN input_reader_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: updating readers" as result;
		ROLLBACK;
    END;
	START TRANSACTION;

		UPDATE Readers SET readerAlias = input_reader_alias WHERE readerID = input_reader_id;

	COMMIT;
END //
DELIMITER ;
-- TO USE: call readers_update_by_id('Veil', 1);

-- update a clubReader by clubReaderID
DROP PROCEDURE IF EXISTS clubreaders_update_by_id;
DELIMITER //

CREATE PROCEDURE clubreaders_update_by_id(
	IN input_clubreader_id INT,
    IN input_club_id INT,
    IN input_reader_id INT
)
BEGIN

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: updating clubreader by ID" as result;
		ROLLBACK;
    END;

	START TRANSACTION;
    
		UPDATE ClubReaders SET clubID = input_club_id, 
								readerID = input_reader_id 
				WHERE clubReaderID = input_clubreader_id;
    
    COMMIT;
END //
DELIMITER ;
-- TO USE: call clubreaders_update_by_id(1, 1, 1);

-- update a club by clubID
DROP PROCEDURE IF EXISTS clubs_update_by_id;
DELIMITER //

CREATE PROCEDURE clubs_update_by_id(
	IN input_club_id INT,
    IN input_club_name VARCHAR(30)
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: update club by id" as result;
		ROLLBACK;
    END;

	START TRANSACTION;
		UPDATE Clubs SET clubName = input_club_name WHERE clubID = input_club_id;
    COMMIT;
END //
DELIMITER ;
-- TO USE: call clubs_update_by_id(1, "Radiant Knights");

-- update a currentRead (clubID, suggestionID) by currentReadID
DROP PROCEDURE IF EXISTS currentreads_update_by_id;
DELIMITER //

CREATE PROCEDURE currentreads_update_by_id(
	IN input_currentread_id INT,
    IN input_club_id INT,
    IN input_suggestion_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: update currentreads by id" as result;
		ROLLBACK;
    END;
	START TRANSACTION;
		UPDATE CurrentReads SET clubID = input_club_id, 
								suggestionID = input_suggestion_id 
				WHERE readID = input_currentread_id;
    COMMIT;
END //
DELIMITER ;
-- TO USE: call currentreads_update_by_id(1, 3, 4);

-- flip CurrentRead to active/inactive by readID
DROP PROCEDURE IF EXISTS currentreads_flip_isactive;
DELIMITER //

CREATE PROCEDURE currentreads_flip_isactive(
	IN input_currentread_id INT
)
BEGIN

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: flip isactive in currentreads" as result;
		ROLLBACK;
    END;
    
    START TRANSACTION;
		UPDATE CurrentReads SET isActive = NOT isActive where readID=input_currentread_id;
    COMMIT;
END //
DELIMITER ;
-- to use: call currentreads_flip_isactive(2);

-- update a milestone by milestoneID
DROP PROCEDURE IF EXISTS milestones_update_by_id;
DELIMITER //

CREATE PROCEDURE milestones_update_by_id(
	IN input_milestone_id INT,
    IN input_milestone_desc VARCHAR(30),
    IN input_milestone_blurb VARCHAR(255)
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: update milestone by id" as result;
		ROLLBACK;
    END;

	START TRANSACTION;
		UPDATE Milestones 
			SET milestoneDesc = input_milestone_desc, 
				milestoneBlurb=input_milestone_blurb
					WHERE milestoneID = input_milestone_id;
    COMMIT;
END //
DELIMITER ;
-- TO USE: call milestones_update_by_id(3, "Let's Meet!!", "This is a discussion meeting");

-- update a read's milestone by readMilestoneID
DROP PROCEDURE IF EXISTS readmilestones_update_by_id;
DELIMITER //

CREATE PROCEDURE readmilestones_update_by_id(
	IN input_readmilestone_id INT,
    IN input_currentread_id INT,
    IN input_milestone_id INT, 
    IN input_readmilestone_date DATE
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: readmilestones update by id" as result;
		ROLLBACK;
    END;
    
    START TRANSACTION;

		UPDATE ReadMilestones 
			SET readID=input_currentread_id, 
            milestoneID=input_milestone_id, 
            readMilestoneDate = input_readmilestone_date 
				WHERE readMilestoneID = input_readmilestone_id;
    COMMIT;
END //
DELIMITER ;
-- TO USE: call readmilestones_update_by_id(3, 1, 1, "2025-01-01");

-- update a suggestion title/author/blurb by suggestionID
DROP PROCEDURE IF EXISTS suggestions_update_by_id;
DELIMITER //

CREATE PROCEDURE suggestions_update_by_id(
	IN input_suggestion_id INT,
    IN input_title VARCHAR(100),
    IN input_author VARCHAR(100),
    IN input_blurb VARCHAR(511),
    IN input_clubreader_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error updating suggestion" as result;
		ROLLBACK;
    END;

	START TRANSACTION;
		UPDATE Suggestions 
			SET title=input_title, 
				author=input_author, 
				blurb=input_blurb,
				clubReaderID = input_clubreader_id
					WHERE suggestionID=input_suggestion_id;
    COMMIT;
END // 
DELIMITER ;
-- TO USE: call suggestions_update_by_id(2, "Stormlight Worldguide", "Brotherwise Games", "This has great info about the radiant orders!", 2);

-- update a priority by suggestionID
DROP PROCEDURE IF EXISTS suggestions_update_priority;
DELIMITER //

CREATE PROCEDURE suggestions_update_priority(
	IN input_suggestion_id INT,
    IN input_priority INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error updating suggestion priority" as result;
		ROLLBACK;
    END;
	START TRANSACTION;
		UPDATE Suggestions 
			SET priority = input_priority 
				WHERE suggestionID = input_suggestion_id;
    COMMIT;
END //
DELIMITER ;
-- TO USE: call suggestions_update_priority(1, 1);

-- flip isActive to its opposite by suggestionID
DROP PROCEDURE IF EXISTS suggestions_flip_isactive;
DELIMITER //

CREATE PROCEDURE suggestions_flip_isactive(
	IN input_suggestion_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "error flipping isactive for suggestion" as result;
		ROLLBACK;
    END;

	START TRANSACTION;
		UPDATE Suggestions SET isActive = NOT isActive WHERE suggestionID = input_suggestion_id;
    COMMIT;

END //
DELIMITER ;
-- TO USE: call suggestions_flip_isactive(6);

-- ************ DELETE *****************

-- delete a suggestion by suggestionID
DROP PROCEDURE IF EXISTS suggestions_remove_by_id;
DELIMITER //

CREATE PROCEDURE suggestions_remove_by_id(
	IN input_suggestion_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: remove suggestion by id" AS result;
		ROLLBACK;
    END;

	START TRANSACTION;
		DELETE FROM Suggestions WHERE suggestionID = input_suggestion_id;
    COMMIT;
END //
DELIMITER ;
-- TO USE: call suggestions_remove_by_id(2);


-- delete a club by clubID
DROP PROCEDURE IF EXISTS clubs_remove_by_id;
DELIMITER //

CREATE PROCEDURE clubs_remove_by_id(
	IN input_club_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: remove club by id" AS result;
		ROLLBACK;
    END;

	START TRANSACTION;
		DELETE FROM Clubs WHERE clubID = input_club_id;
    COMMIT;
END //
DELIMITER ;
-- TO USE: call clubs_remove_by_id(3);

-- delete an admin by adminID
DROP PROCEDURE IF EXISTS clubadmins_remove_by_id;
DELIMITER //

CREATE PROCEDURE clubadmins_remove_by_id(
	IN input_admin_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: remove clubadmin by id" AS result;
		ROLLBACK;
    END;

	START TRANSACTION;
		DELETE FROM ClubAdmins WHERE clubAdminID = input_admin_id;
    COMMIT;
END //
DELIMITER ;
-- TO USE: call clubadmins_remove_by_id(3);

-- remove clubReader by clubID and readerID
DROP PROCEDURE IF EXISTS clubreader_remove_by_info;
DELIMITER //

CREATE PROCEDURE clubreader_remove_by_info(
	IN input_club_id INT,
    IN input_reader_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: removing clubreader by clubID, readerID" as result;
		ROLLBACK;
    END;
	START TRANSACTION;
		DELETE FROM clubReaders 
			WHERE clubID = input_club_id 
            AND readerID = input_reader_id;
    COMMIT;
END //
DELIMITER ;
-- TO USE: call clubreader_remove_by_info(2,3);

-- remove milestone by milestoneID
DROP PROCEDURE IF EXISTS milestone_remove_by_id;
DELIMITER //

CREATE PROCEDURE milestone_remove_by_id(
	IN input_milestone_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: remove milestone by id" AS result;
		ROLLBACK;
    END;

	START TRANSACTION;
		DELETE FROM Milestones WHERE milestoneID = input_milestone_id;
    COMMIT;
END //
DELIMITER ;
-- TO USE: call milestone_remove_by_id(4);

-- delete a currentRead by readID
DROP PROCEDURE IF EXISTS currentread_remove_by_id;
DELIMITER //

CREATE PROCEDURE currentread_remove_by_id(
	IN input_currentread_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: remove currentread by id" AS result;
		ROLLBACK;
    END;

	START TRANSACTION;
		DELETE FROM Currentreads WHERE readID = input_currentread_id;
    COMMIT;
END //
DELIMITER ;
-- TO USE: call currentread_remove_by_id(1);

-- delete from readMilestones by readMilestoneID
DROP PROCEDURE IF EXISTS readmilestones_remove_by_id;
DELIMITER //

CREATE PROCEDURE readmilestones_remove_by_id(
	IN input_readmilestone_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: remove readmilestone by id" AS result;
		ROLLBACK;
    END;

	START TRANSACTION;
		DELETE FROM Readmilestones WHERE readmilestoneID = input_readmilestone_id;
    COMMIT;
END //
DELIMITER ;
-- TO USE: call readmilestones_remove_by_id(3);

-- delete inactive suggestions
DROP PROCEDURE IF EXISTS suggestions_delete_inactive;
DELIMITER //

CREATE PROCEDURE suggestions_delete_inactive()
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error deleting inactive suggestions" as result;
		ROLLBACK;
    END;
	START TRANSACTION;
		DELETE FROM Suggestions WHERE isActive = 0;
    COMMIT;
END //
DELIMITER ;
-- TO USE: call suggestions_delete_inactive();

-- delete inactive reads
DROP PROCEDURE IF EXISTS currentreads_delete_inactive;
DELIMITER //

CREATE PROCEDURE currentreads_delete_inactive()
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error deleting inactive currentreads" as result;
		ROLLBACK;
    END;
	START TRANSACTION;
		DELETE FROM CurrentReads WHERE isActive = 0;
    COMMIT;
END //
DELIMITER ;
-- TO USE: call currentreads_delete_inactive();

-- delete reader by readerID
DROP PROCEDURE IF EXISTS readers_remove_by_id;
DELIMITER //

CREATE PROCEDURE readers_remove_by_id(
	IN input_reader_id INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		SELECT "Error: remove reader by id" AS result;
		ROLLBACK;
    END;

	START TRANSACTION;
		DELETE FROM Readers WHERE readerID = input_reader_id;
    COMMIT;
END //
DELIMITER ;
-- TO USE: call readers_remove_by_id(5);

-- ---------------------- CHANGES ----------------------------

-- add to changes
DROP PROCEDURE IF EXISTS changes_add_new;
DELIMITER //

CREATE PROCEDURE changes_add_new (
	IN input_suggestion INT,
	IN input_change_amount INT
)
BEGIN

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		SELECT "Error: changes add new" AS result;
		ROLLBACK;
	END;

	START TRANSACTION;

		INSERT INTO Changes (changeDate, suggestionID, changeAmount)
			VALUES (NOW(), input_suggestion, input_change_amount);

		SELECT LAST_INSERT_ID() as changeID;
	COMMIT;
END //
DELIMITER ;

-- USAGE: call changes_add_new(2, -1);

DROP PROCEDURE IF EXISTS get_top_books;
DELIMITER //

CREATE PROCEDURE get_top_books(
	IN input_clubID INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		SELECT "Error: get_top_books" as result;
		ROLLBACK;
	END;
	START TRANSACTION;

		SELECT Suggestions.suggestionID as 'suggestionID', ClubReaders.clubID, IFNULL(ChangeTotals.change, 0) AS total_change
			FROM Suggestions 
			LEFT JOIN ClubReaders 
				ON Suggestions.clubReaderID = ClubReaders.clubReaderID
					LEFT JOIN 
						(SELECT suggestionID, SUM(changeAmount) AS 'change' 
							FROM Changes GROUP BY suggestionID) as ChangeTotals 
								ON Suggestions.suggestionID = ChangeTotals.suggestionID
									-- WHERE ClubReaders.clubID = input_clubID
									ORDER BY total_change DESC;

	COMMIT;
END //
DELIMITER ;
