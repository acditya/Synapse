# NMSS Synapse Database Setup

## Overview
This document provides comprehensive instructions for setting up the NMSS Synapse database using Supabase.

## Prerequisites
- Supabase account (https://supabase.com)
- Node.js and npm installed
- Basic understanding of SQL and databases

## Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `nmss-synapse`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## Step 2: Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `SYNAPSE_DB.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the schema

## Step 3: Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Optional: For development
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Configuration (for external services)
REACT_APP_API_URL=http://localhost:8000

# Scholar Service Configuration
REACT_APP_SCHOLAR_API_URL=https://api.scholar.com
REACT_APP_SCHOLAR_API_KEY=your-scholar-api-key

# News API Configuration
REACT_APP_NEWS_API_URL=https://newsapi.org/v2
REACT_APP_NEWS_API_KEY=your-news-api-key

# LLM Service Configuration
REACT_APP_LLM_API_URL=https://api.openai.com/v1
REACT_APP_LLM_API_KEY=your-llm-api-key

# File Storage Configuration
REACT_APP_STORAGE_BUCKET=nmss-documents
REACT_APP_STORAGE_URL=https://your-project.supabase.co/storage/v1
```

## Step 4: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon public** key → `REACT_APP_SUPABASE_ANON_KEY`
   - **service_role** key → `REACT_APP_SUPABASE_SERVICE_ROLE_KEY` (optional)

## Step 5: Install Dependencies

```bash
cd frontend
npm install @supabase/supabase-js
```

## Step 6: Update Application Code

Replace the local database service with Supabase:

```typescript
// In your components, replace:
import { localDatabase } from '../services/localDatabase'

// With:
import { supabaseService } from '../services/supabaseService'
```

## Database Schema Overview

### Core Tables

1. **users** - User accounts and profiles
2. **applications** - Grant applications
3. **application_documents** - File attachments
4. **application_flags** - Eligibility and compliance flags

### ARL Assessment Tables

5. **arl_assessments** - ARL evaluation results
6. **arl_milestones** - Individual milestone tracking
7. **stb_answers** - STB interview responses
8. **benchmark_scores** - Multi-dimensional scoring

### Scholar Profile Tables

9. **scholar_profiles** - Academic profiles
10. **publications** - Research publications
11. **funding_history** - Grant history
12. **news_profiles** - Media reputation
13. **news_items** - News mentions

### Reviewer System Tables

14. **reviewers** - Reviewer profiles
15. **reviewer_conflicts** - Conflict of interest tracking
16. **reviewer_assignments** - Application assignments
17. **reviewer_reviews** - Review submissions

### Utility Tables

18. **external_signals** - External reputation data
19. **audit_log** - System audit trail

## Key Features

### Row Level Security (RLS)
- Users can only access their own data
- Reviewers can only see assigned applications
- Admins have full access

### Real-time Subscriptions
- Live updates for applications
- Real-time ARL assessment changes
- Dynamic reviewer assignment updates

### Advanced Functions
- **calculate_arl_progress()** - ARL progress calculation
- **calculate_reviewer_match_score()** - AI-powered reviewer matching
- **get_recommended_reviewers()** - Intelligent reviewer recommendations
- **search_applications()** - Full-text search
- **search_reviewers()** - Advanced reviewer search

### Performance Optimizations
- Comprehensive indexing strategy
- Full-text search capabilities
- Optimized queries for common operations

## Sample Data

The schema includes sample data for development:
- 3 sample applications
- 5 reviewer profiles
- Complete ARL assessment data
- Scholar profiles with publications

## Security Features

1. **Row Level Security** - Data isolation by user
2. **Audit Logging** - Complete action tracking
3. **Conflict Detection** - Reviewer conflict management
4. **Data Validation** - Type safety and constraints

## Monitoring and Analytics

### Built-in Views
- **application_summaries** - Application overview
- **reviewer_profiles** - Reviewer information
- **arl_progress_view** - ARL progress tracking

### Statistics Functions
- **get_application_stats()** - Application metrics
- **get_reviewer_stats()** - Reviewer metrics

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check RLS policies
   - Verify user authentication
   - Ensure proper role assignment

2. **Connection Issues**
   - Verify environment variables
   - Check Supabase project status
   - Test network connectivity

3. **Schema Errors**
   - Re-run the SQL script
   - Check for syntax errors
   - Verify table creation

### Debug Mode

Enable debug logging:
```typescript
const supabase = createClient(url, key, {
  auth: {
    debug: true
  }
})
```

## Production Considerations

1. **Backup Strategy**
   - Enable automatic backups
   - Set up point-in-time recovery
   - Regular backup testing

2. **Performance Monitoring**
   - Monitor query performance
   - Set up alerts for slow queries
   - Regular index optimization

3. **Security Hardening**
   - Regular security audits
   - Update dependencies
   - Monitor access patterns

## Support

For issues with the database setup:
1. Check Supabase documentation
2. Review error logs in Supabase dashboard
3. Test with sample data first
4. Verify all environment variables

## Next Steps

After successful setup:
1. Test all CRUD operations
2. Verify real-time subscriptions
3. Test user authentication
4. Validate ARL assessment workflow
5. Test reviewer matching system

The database is now ready for the NMSS Synapse application!
