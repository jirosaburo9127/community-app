-- Search: enable pg_trgm extension and add ILIKE-optimized indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index for posts title/body search
CREATE INDEX idx_posts_title_trgm ON posts USING gin (title gin_trgm_ops);
CREATE INDEX idx_posts_body_trgm ON posts USING gin (body gin_trgm_ops);

-- Index for startups name/description search
CREATE INDEX idx_startups_name_trgm ON startups USING gin (name gin_trgm_ops);
CREATE INDEX idx_startups_description_trgm ON startups USING gin (description gin_trgm_ops);
