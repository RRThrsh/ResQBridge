-- Schema created: 2026-06-12
-- Source: backend/convex/schema.ts
-- Last updated: 2026-06-20

-- ============================================================
-- otps — One-time passwords for email-based authentication
-- ============================================================
CREATE TABLE otps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expiresAt BIGINT NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    _creationTime BIGINT NOT NULL,
    INDEX by_email (email)
);

-- ============================================================
-- users — Application users with role-based access control
-- ============================================================
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

-- ============================================================
-- logs — Audit trail for user actions, guest visits, events
-- Added: 2026-06-19
-- ============================================================
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

-- ============================================================
-- config — Key-value application/landing page configuration
-- ============================================================
CREATE TABLE config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) NOT NULL UNIQUE,
    `value` TEXT NOT NULL,
    INDEX by_key (`key`)
);

-- ============================================================
-- reports — Animal rescue incident reports
-- Added: 2026-06-20
-- ============================================================
CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL,
    animalType VARCHAR(100) NOT NULL,
    urgency VARCHAR(50) NOT NULL,
    location VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    images TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    assignedTo VARCHAR(36),
    reporterIp VARCHAR(45) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    createdAt BIGINT NOT NULL,
    INDEX by_createdAt (createdAt),
    INDEX by_status (status)
);
