-- Run this once on an existing ResearchHub database.
-- Longer space is useful for shared Google Drive/OneDrive and signed URLs.
alter table ProgressReport modify filepath varchar(2048);
