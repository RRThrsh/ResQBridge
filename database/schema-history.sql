-- Schema created: 2026-06-12
-- Source: backend/convex/schema.ts
-- Last updated: 2026-07-12 (added expenses, adminNotifications; updated all comments)

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
-- Role added: 2026-07-07 (superadmin, admin, rescuer, user)
-- Availability added: 2026-07-07
-- ============================================================
CREATE TABLE users (
    uuid VARCHAR(36) PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'admin', 'rescuer', 'user') NOT NULL DEFAULT 'user',
    availability ENUM('available', 'busy') DEFAULT NULL,
    _creationTime BIGINT NOT NULL,
    INDEX by_email (email),
    INDEX by_uuid (uuid)
);

-- ============================================================
-- admins — Admin accounts (separate from users table)
-- Added: 2026-07-07
-- ============================================================
CREATE TABLE admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    _creationTime BIGINT NOT NULL,
    INDEX by_email (email)
);

-- ============================================================
-- rescuers — Rescuer accounts (separate from users table)
-- Added: 2026-07-07
-- ============================================================
CREATE TABLE rescuers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL,
    _creationTime BIGINT NOT NULL,
    INDEX by_email (email)
);

-- ============================================================
-- reports — Animal rescue incident reports
-- Added: 2026-06-20
-- Aligned with schema: 2026-07-07 (assignedUser, reporterIp, archivedAt, archivedByName, resolvedAt)
-- ============================================================
CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL,
    animalType VARCHAR(100) NOT NULL,
    urgency VARCHAR(50) NOT NULL,
    location VARCHAR(500) NOT NULL,
    description TEXT DEFAULT NULL,
    images TEXT DEFAULT NULL,
    latitude DOUBLE DEFAULT NULL,
    longitude DOUBLE DEFAULT NULL,
    status ENUM('pending','assigned','en_route','in_progress','resolved','failed') NOT NULL DEFAULT 'pending',
    assignedTo VARCHAR(36) DEFAULT NULL,
    assignedUser JSON DEFAULT NULL,
    reporterEmail VARCHAR(255) DEFAULT NULL,
    reporterIp VARCHAR(45) DEFAULT NULL,
    createdAt BIGINT NOT NULL,
    archivedAt BIGINT DEFAULT NULL,
    archivedByName VARCHAR(255) DEFAULT NULL,
    resolvedAt BIGINT DEFAULT NULL,
    _creationTime BIGINT NOT NULL,
    INDEX by_assignedTo (assignedTo),
    INDEX by_status (status)
);

-- ============================================================
-- rescuerLocations — Real-time rescuer GPS tracking
-- Added: 2026-07-07
-- ============================================================
CREATE TABLE rescuerLocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    userName VARCHAR(255) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    heading DOUBLE DEFAULT NULL,
    speed DOUBLE DEFAULT NULL,
    updatedAt BIGINT NOT NULL,
    reportId VARCHAR(255) DEFAULT NULL,
    animalName VARCHAR(255) DEFAULT NULL,
    isTracking BOOLEAN DEFAULT FALSE,
    INDEX by_userId (userId),
    INDEX by_tracking (isTracking)
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
-- shifts — Rescuer weekly shift schedules
-- Added: 2026-07-07
-- ============================================================
CREATE TABLE shifts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    dayOfWeek TINYINT NOT NULL,
    startTime VARCHAR(5) NOT NULL,
    endTime VARCHAR(5) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX by_userId (userId),
    INDEX by_userId_and_day (userId, dayOfWeek)
);

-- ============================================================
-- activityLogs — Audit trail for rescuer activity
-- Added: 2026-07-07
-- ============================================================
CREATE TABLE activityLogs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    action VARCHAR(255) NOT NULL,
    reportId VARCHAR(255) DEFAULT NULL,
    details TEXT NOT NULL,
    createdAt BIGINT NOT NULL,
    INDEX by_userId (userId)
);

-- ============================================================
-- logs — Audit trail for user actions, guest visits, events
-- Added: 2026-06-19
-- ============================================================
CREATE TABLE logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(36) DEFAULT NULL,
    eventType VARCHAR(50) NOT NULL,
    section VARCHAR(255) DEFAULT NULL,
    ipAddress VARCHAR(45) NOT NULL,
    userAgent VARCHAR(500) DEFAULT NULL,
    metadata JSON DEFAULT NULL,
    sessionDuration INT DEFAULT NULL,
    createdAt BIGINT NOT NULL,
    INDEX by_eventType (eventType),
    INDEX by_ipAddress (ipAddress),
    INDEX by_createdAt (createdAt)
);

-- ============================================================
-- adminNotifications — Real-time alerts for admin dashboard
-- Added: 2026-06-24
-- ============================================================
CREATE TABLE adminNotifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500) DEFAULT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt BIGINT NOT NULL,
    INDEX by_read (read),
    INDEX by_createdAt (createdAt)
);

-- ============================================================
-- equipmentChecklists — Equipment checklists per rescue report
-- Added: 2026-07-07
-- ============================================================
CREATE TABLE equipmentChecklists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reportId VARCHAR(255) NOT NULL,
    userId VARCHAR(36) NOT NULL,
    items JSON NOT NULL,
    createdAt BIGINT NOT NULL,
    updatedAt BIGINT NOT NULL,
    INDEX by_reportId (reportId)
);

-- ============================================================
-- expenses — Rescuer expense tracking with reimbursement workflow
-- Added: 2026-07-12 (synchronized from schema.ts)
-- ============================================================
CREATE TABLE expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    reportId VARCHAR(255) DEFAULT NULL,
    category VARCHAR(100) NOT NULL,
    amount DOUBLE NOT NULL,
    description TEXT NOT NULL,
    receiptImages JSON DEFAULT NULL,
    status ENUM('pending','approved','reimbursed','rejected') NOT NULL DEFAULT 'pending',
    createdAt BIGINT NOT NULL,
    INDEX by_userId (userId),
    INDEX by_reportId (reportId)
);

-- ============================================================
-- reportNotes — Internal notes attached to reports
-- Added: 2026-07-07
-- ============================================================
CREATE TABLE reportNotes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reportId VARCHAR(255) NOT NULL,
    userId VARCHAR(36) NOT NULL,
    userName VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    createdAt BIGINT NOT NULL,
    INDEX by_reportId (reportId)
);

-- ============================================================
-- voiceNotes — Voice recordings attached to reports
-- Added: 2026-07-07
-- ============================================================
CREATE TABLE voiceNotes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reportId VARCHAR(255) NOT NULL,
    userId VARCHAR(36) NOT NULL,
    userName VARCHAR(255) NOT NULL,
    audioUrl TEXT NOT NULL,
    duration INT DEFAULT NULL,
    createdAt BIGINT NOT NULL,
    INDEX by_reportId (reportId)
);
