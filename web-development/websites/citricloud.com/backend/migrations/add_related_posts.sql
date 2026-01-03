-- Add related posts association table
-- Run this migration to enable the Related Posts feature

-- Create the association table for blog post related posts
CREATE TABLE IF NOT EXISTS blog_post_related (
    blog_post_id INTEGER NOT NULL,
    related_post_id INTEGER NOT NULL,
    PRIMARY KEY (blog_post_id, related_post_id),
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (related_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_post_related_post_id ON blog_post_related(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_related_related_id ON blog_post_related(related_post_id);
