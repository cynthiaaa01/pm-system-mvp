ALTER TABLE proposals ADD COLUMN tags TEXT[] DEFAULT '{}';
ALTER TABLE proposals ADD COLUMN client_tag TEXT;
