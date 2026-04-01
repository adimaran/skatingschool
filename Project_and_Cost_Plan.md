# Project & Cost Plan: Skating School Administration

**By: [Your Name]**

## 1. Project Concept
The Skating School Administration MVP is a platform to help a local skating school migrate from paper-tracking to a streamlined digital experience. It manages daily sessions, skill tracking, make-up classes, instructor feedback, and complex ice-show schedules. 

**Technical Stack**: 
- **Frontend/Backend**: Next.js (Hosted on Vercel)
- **Database/Auth**: Supabase
- **CSS**: Vanilla CSS 
- **AI Coding Agents**: Copilot / Base44 (Internal) / Lovable

## 2. Vibe Tasks (Phase 2 Roadmap)
These are the specific structured prompts we will use to instruct an AI agent to build out Phase 2 functionalities:

1. **Schema Generation**: "Set up the Supabase database schema for Skating Classes, including columns for class name, instructor ID, start time, end time, and skill level."
2. **Attendance Tracker**: "Create an Attendance Tracking interface for instructors where they can view a list of kids in their class and toggle attendance checkboxes for each date."
3. **Skill Checklist**: "Implement a skill checklist component for instructors to mark individual skills (e.g., '2-foot turn', 'crossovers') as passed for specific students."
4. **Parent Dashboard**: "Build a Parent Dashboard that fetches and displays the attendance history and passed skills for their assigned child."
5. **Make-up Logic**: "Create a 'Make-up Session' booking UI where parents can select an alternative time slot if their child missed a regular class, updating the database accordingly."
6. **Feedback Engine**: "Develop a Rating system allowing parents to submit a 1-5 star review and text feedback for their child's instructor, saving to a Feedback table."
7. **Admin Moderation**: "Add an Admin Approval feed where administrators can review, approve, or hide parent feedback before it is visible to instructors."
8. **Ice Show Calendar**: "Build an Ice Show calendar generator that groups different skill levels into rehearsal blocks and outputs an interactive weekly schedule view."

## 3. Economic Forecast 
**Assumptions:** 10 requests per user per month. Image storage assumes 1MB profile pictures.

| Metric | 500 Users | 5,000 Users | 50,000 Users |
|---|---|---|---|
| Traffic | 5,000 reqs | 50,000 reqs | 500,000 reqs |
| Image Storage | 500 MB | 5 GB | 50 GB |
| Vercel (Next.js Hosting) | $0 | $20 (Pro) | ~$35 (Pro + extra usage) |
| Supabase (Auth + DB) | $0 | $25 (Pro) | ~$45 (Pro + compute usage) |
| **Total** | **$0 / mo** | **$45 / mo** | **$80+ / mo** |

*Critical Note: As scale increases to 50,000 users, 50GB of image storage will approach the limits of basic Pro tiers, meaning bandwidth and processing costs (if resizing images) will start heavily dictating the $80+ baseline cost.*

## 4. Testing Roadmap
To verify connectivity and authentication success:
1. Setup local environment using `.env.local` to point to Supabase URL/keys.
2. Initialize and run `npm run dev` to load the application frontend.
3. Manual Sign-Up Test: Submit valid credentials into the Registration UI. 
4. Verify routing logic successfully directs to the correct dashboard based on the user's role (Admin, Kid, Instructor).
5. Verify Data: Refresh the [Supabase Dashboard](https://supabase.com/dashboard/projects) to confirm the new user rows exist in the `auth.users` tables.
6. Record screen demonstrating the UI registration mapping to the backend creation.
