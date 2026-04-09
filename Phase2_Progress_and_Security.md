# Phase 2: Progress & Security Analysis 

**Project:** Skating School Administration

## 1. Feature Delta (Status Update)
✅ **Done this week (Phase 2):** 
- Established the `Classes`, `Enrollments`, and `Skills Passed` relational tables in the database.
- Implemented Supabase data-fetching logic on the Instructor Dashboard to display available classes.
- Integrated the `Jest` unit-testing framework and wrote a test verifying the business logic for Ice Show attendance calculations.
- Applied complex Row Level Security (RLS) policies to close database interaction leaks.

⏳ **Remaining tasks for Phase 3 (Group Integration):** 
- Add toggles so the Instructor can actually mark attendance for the kids in their classes.
- Connect the Parent Dashboard so it can pull the specific passed skating skills for their child.
- Refine the global UI design to ensure mobile optimization for parents at the Ice Rink.

## 2. Risk Assessment

### 3 Worst-Case Scenarios (Fixed by RLS)
1. **Data Deletion / Hijacking**: Without RLS, a technically-savvy parent could execute a delete statement to remove the class enrollments of other kids, leaving the instructor without an accurate attendance list on Saturday morning.
2. **Privacy Leaks**: A student or parent could view the detailed feedback and skill-fail notes of all other students across the entire school rather than just their own. 
3. **Schedule Vandalism**: Any logged-in user could manipulate the `classes` table to change class times or delete sessions entirely, throwing the entire skating school schedule into chaos. (This was fixed by restricting write access strictly to 'Admin' profile rows).

### 3 "Non-Issue" Impossible Risks
1. **Credit Card Theft**: We are explicitly not processing any payments in this MVP—it is an administration and skill tracking tool, eliminating all financial PCI-compliance risks entirely.
2. **SQL Injection**: We are using the native Supabase Client which utilizes PostgREST. This means our queries are automatically translated into safe, parameterized API calls, making classic raw SQL injection virtually impossible.
3. **Server Room Infrastructure Failure**: The local skating school isn't hosting a server in a closet that can catch fire or lose power. We are utilizing Vercel's edge-network and Supabase cloud hosting, guaranteeing massive uptime and automatic scaling.

## 3. Security Dialogue 
I asked my AI Agent to act as a "Security Consultant" and audit my Phase 1 database infrastructure. It immediately flagged that while I secured my `profiles` table, my Phase 2 tables (`classes`, `enrollments`, `skills_passed`) were entirely exposed because they lacked Row-Level Security (RLS) policies. I used the AI to generate a precise PostgreSQL patch script that locked down those tables so only Admins can create classes, and Students can only view their own data.
**Chat Log**: [Link to this chat thread]

## 4. Unit Testing 
*(Insert your terminal screenshot showing `1 passed, 1 total` here)*

---

## Reflection Questions

**Q1: How would you rate your overall "Technical Literacy" on Databases before starting this project?**
(3) Conversational: I knew the terms and concepts, but couldn't write the code from scratch.

**Q2: How much did your prior knowledge (or lack thereof) impact your ability to "steer" the AI when things got complex?**
(2) Slightly Limiting: I felt "blind" sometimes, trusting the AI's logic without being able to verify it.

**Q3: Describe a specific moment where you either caught a mistake because you knew the tech (SQL/Code/Terminal), or a moment you felt completely lost and had to trust the agent blindly.**
I felt slightly lost when the AI discovered that our database tables lacked Row Level Security policies during Phase 2. I had to blindly trust the AI's complex PostgreSQL policy script to lock down the tables. Because I only knew the basic concept of what RLS did, I was completely relying on the AI to generate the exact syntactical checks correctly.

**Q4: After this experience, do you believe that deep-diving into syntax (learning to code "the hard way") re databases is necessary, or is "System Literacy" (understanding how things connect) enough for you to feel confidence during development?**
While being a "vibe programmer" makes rapid development incredibly fast, learning SQL syntax more deeply would still be valuable so I don't feel quite so "blind" when security policies are generated. However, going strictly back to writing database code piece-by-piece from scratch does feel inefficient now that I can easily spin up complex architectures using AI agents. System Literacy lets me design the house and build it fast, but I realize I still need to understand the underlying plumbing better so I can spot and fix the leaks myself.
