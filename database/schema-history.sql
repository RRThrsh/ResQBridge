-- Schema created: 2026-06-12
-- Source: backend/convex/schema.ts

CREATE TABLE users (
    uuid VARCHAR(36) PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'admin', 'domestic', 'rescuer', 'user') NOT NULL DEFAULT 'user',
    _creationTime BIGINT NOT NULL,
    INDEX by_email (email),
    INDEX by_uuid (uuid)
);
