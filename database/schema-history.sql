-- Schema created: 2026-06-12
-- Source: backend/convex/schema.ts

CREATE TABLE otps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expiresAt BIGINT NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    _creationTime BIGINT NOT NULL,
    INDEX by_email (email)
);

CREATE TABLE users (
    uuid VARCHAR(36) PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'admin', 'rescuer', 'user') NOT NULL DEFAULT 'user',
    _creationTime BIGINT NOT NULL,
    INDEX by_email (email),
    INDEX by_uuid (uuid)
);

-- Added: 2026-06-19
-- Audit log for all user transactions

CREATE TABLE logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(36),
    eventType VARCHAR(50) NOT NULL,
    section VARCHAR(255),
    ipAddress VARCHAR(45) NOT NULL,
    userAgent VARCHAR(500),
    metadata JSON,
    sessionDuration INT,
    createdAt BIGINT NOT NULL,
    INDEX by_eventType (eventType),
    INDEX by_ipAddress (ipAddress),
    INDEX by_createdAt (createdAt)
);

-- Application configuration key-value store

CREATE TABLE config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) NOT NULL UNIQUE,
    `value` TEXT NOT NULL,
    INDEX by_key (`key`)
);
