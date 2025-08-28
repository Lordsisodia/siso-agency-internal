# Database Restoration Guide

This guide explains how to restore your database from the backup file `database-backup-1756416095341.json` using the provided restoration scripts.

## 📋 Overview

The backup contains:
- **1 User** - Your main user account
- **10 Personal Tasks** - Various work tasks with different priorities and work types
- **27 Personal Subtasks** - Nested subtasks under the main tasks
- **3 Morning Routines** - Daily morning routine tracking for different dates
- **1 Personal Context** - Your personal goals and preferences

## 🚀 Quick Start

### 1. Run the Restoration Script

```bash
node restore-database.js
```

This script will:
- ✅ Load and validate the backup file
- ✅ Clear existing database data (to prevent duplicates)
- ✅ Restore data in proper dependency order (Users → Context → Tasks → Routines)
- ✅ Handle all relationships correctly
- ✅ Provide detailed progress output
- ✅ Verify the restoration was successful

### 2. Verify the Restoration (Optional)

```bash
node verify-restoration.js
```

This script will:
- ✅ Check basic data counts
- ✅ Verify all relationships are intact
- ✅ Run data integrity checks
- ✅ Test complex database queries
- ✅ Provide a comprehensive report

## 📊 Expected Results

After successful restoration, you should have:

| Entity | Count | Description |
|--------|-------|-------------|
| Users | 1 | Your main user account |
| Personal Tasks | 10 | Various work tasks (DEEP/LIGHT work) |
| Personal Subtasks | 27 | Subtasks nested under main tasks |
| Morning Routines | 3 | Daily tracking for 3 different dates |
| Personal Context | 1 | Your goals and preferences |

## 🔧 Script Details

### restore-database.js

**Features:**
- 🎨 Colored console output for easy monitoring
- 📈 Real-time progress tracking
- 🔄 Proper dependency order (avoids foreign key conflicts)
- 🛡️ Data validation and error handling
- ✅ Built-in verification after restoration
- 🎯 Handles complex nested data (tasks with subtasks)

**Order of Operations:**
1. **Users** - Created first (required for all other entities)
2. **Personal Context** - User preferences and goals
3. **Personal Tasks** - Main tasks with all subtasks
4. **Morning Routines** - Daily routine tracking

### verify-restoration.js

**Features:**
- 📊 Comprehensive data counting
- 🔗 Relationship integrity verification
- 🧪 Complex query testing
- 📋 Detailed data inspection
- ✅ Pass/fail verification summary

## 🗃️ Database Schema Overview

The restoration handles these Prisma models and their relationships:

```
User (1)
├── PersonalContext (1) ─── User relationship
├── PersonalTask (10) ────── User relationship
│   └── PersonalSubtask (27) ─── Task relationship
└── MorningRoutineTracking (3) ─── User relationship
```

## ⚠️ Important Notes

### Before Running the Script

1. **Environment Setup**: Ensure your `.env` file contains the correct `PRISMA_DATABASE_URL` and `DATABASE_URL`
2. **Backup Current Data**: If you have existing data you want to keep, create a backup first
3. **Prisma Client**: Make sure the Prisma client is generated (`npx prisma generate`)

### Data Handling

- **Destructive Operation**: The script clears existing data before restoration
- **Relationship Integrity**: All foreign key relationships are maintained
- **Date Handling**: Timestamps are properly converted to JavaScript Date objects
- **Enum Values**: All enum fields (WorkType, Priority, etc.) are preserved

### Error Handling

- **Foreign Key Constraints**: Script handles dependency order to avoid conflicts
- **Data Validation**: Validates backup file structure before processing
- **Graceful Failures**: Provides detailed error messages for troubleshooting
- **Database Connection**: Properly disconnects on completion or error

## 🐛 Troubleshooting

### Common Issues

#### 1. "Backup file not found"
- **Cause**: The backup file is missing or path is incorrect
- **Solution**: Ensure `database-backup-1756416095341.json` is in the project root

#### 2. "Database connection error"
- **Cause**: Missing or incorrect database URL in environment variables
- **Solution**: Check `.env` file for `PRISMA_DATABASE_URL` and `DATABASE_URL`

#### 3. "Foreign key constraint error"
- **Cause**: Data dependency issues (rare, as script handles order correctly)
- **Solution**: Re-run the script - it clears data first to avoid conflicts

#### 4. "User already exists" warnings
- **Cause**: Partial restoration from previous attempt
- **Solution**: This is normal - script handles existing data gracefully

### Verification Failures

If verification fails, check:
- Database connection is stable
- All expected tables exist in your Prisma schema
- No schema mismatches between backup and current database

## 📁 File Structure

```
/
├── database-backup-1756416095341.json  # Source backup file
├── restore-database.js                 # Main restoration script
├── verify-restoration.js               # Verification script
├── DATABASE-RESTORE-README.md          # This guide
├── generated/prisma/index.js           # Prisma client
└── .env                                # Database configuration
```

## 🔍 Script Output Examples

### Successful Restoration Output:
```
🚀 Starting Database Restoration
===============================================

📁 Loading backup file...
✅ Backup file loaded successfully
📊 Backup created: 8/28/2025, 10:21:35 PM

📋 Backup Summary:
  users: 1
  personalTasks: 10
  morningRoutineTracking: 3
  personalContext: 1

🧹 Clearing existing data...
✅ Database cleared successfully

👥 Restoring Users...
  Progress: 1/1 (100.0%) users
  ✅ Created user: user_31c4PuaPdFf9abejhmzrN9kcill@clerk.generated
✅ Users restoration completed

[... additional progress output ...]

🎉 Database restoration completed successfully!
```

### Successful Verification Output:
```
🔍 Database Restoration Verification
=====================================

📊 Basic Data Counts
  users: 1
  personalTasks: 10
  personalSubtasks: 27
  morningRoutineTracking: 3
  personalContext: 1

🔗 Verifying Relationships
  ✅ Personal Tasks with valid users: 10/10
  ✅ Subtasks with valid parent tasks: 27/27
  ✅ Personal Context with valid users: 1/1
  ✅ Morning Routines with valid users: 3/3

[... additional verification output ...]

✅ All verification checks passed!
✅ Database restoration was successful
```

## 📞 Support

If you encounter issues:

1. **Check the output logs** - The scripts provide detailed error messages
2. **Verify environment setup** - Ensure database URLs are correct
3. **Try verification script** - Run `node verify-restoration.js` to diagnose issues
4. **Check Prisma schema** - Ensure it matches the backup data structure

---

**Created:** August 28, 2025  
**Backup File:** database-backup-1756416095341.json  
**Data Count:** 1 User, 10 Tasks, 27 Subtasks, 3 Routines, 1 Context