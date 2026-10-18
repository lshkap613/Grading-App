# Gradebook App: Product Specification

Oct 13, 2026 · @""

## Overview

This app replaces a multi-tab Excel gradebook with a web app that any teacher can configure to their own grading rules, and it makes "drills" (repeated practice with visible progress) a first-class feature. It is a portfolio project, so it is built end to end: data model, grading engine, UI, email, import, tests and a live deploy.

Goals:

- Keep everything the spreadsheet does: per-class gradebooks, weighted totals, letter grades, participation, and drill progress reports.
- Make every rule configurable instead of hardcoded: category names, weights, grade scale, late-work policy and drill length.
- Remove the spreadsheet's fragile parts (cell references that point at the wrong student, `#REF!` errors, mixed text and numbers in score cells).
- Show employers a product, not a personal tool: clean architecture, a tested grading engine and a polished UX.

## Users and scope

The only app user in v1 is the teacher. Students and parents receive output (printed strips, emails) but do not log in.

| Person  | What they do in v1                                                                       |
| ------- | ---------------------------------------------------------------------------------------- |
| Teacher | Creates classes, enters scores, configures rules, runs drills, prints and emails reports |
| Student | Sees their own drill progress on a printed strip or in an email sent to their parents    |
| Parent  | Receives the drill report by email                                                       |

In scope for v1: classes and rosters, configurable categories and weights, saved weight presets, configurable grade scale, excused/missing/late handling, drills, drill reports (print and email), paste/CSV import, optional seating charts, attendance, missing-work lists, and final grade comments with AI suggestions.

Out of scope for v1: student or parent logins, sharing a class between teachers, a mobile app, a score change history, a what-if grade calculator, score adjustments and curves (possibly in a later version), email in other languages, drill target scores, and the Daily Roll attendance sheet (see the last section).

## Core concepts and data model

In the spreadsheet, tab names such as HW, Q and T were hardcoded. In the app they are teacher-defined categories, and weights are saved as reusable presets.

| Entity        | Key fields                                                                                                                | Notes                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Teacher       | name, email                                                                                                               | Owns all data below                                                                                                   |
| Class         | name, grade level, school year, weight set, grade scale, rounding, low-score threshold, late policy, default drill length | Weights are copied from a preset when the class is created, then editable per class                                   |
| Student       | name, parent email(s)                                                                                                     | Belongs to one or more classes                                                                                        |
| Category      | name, weight, type                                                                                                        | Teacher-defined (Homework, Quizzes, Tests, Projects, ...). Type is "assignments" or "daily score" (for participation) |
| Assignment    | category, title, date, points possible                                                                                    | Points possible defaults to 100; extra credit allowed                                                                 |
| Score         | student, assignment, value, status, original value                                                                        | Status is graded, missing, excused or late                                                                            |
| Weight preset | name, list of categories with weights                                                                                     | Saved per teacher; a system default exists and cannot be deleted                                                      |
| Grade scale   | name, list of (minimum %, letter)                                                                                         | Saved per teacher; the system default is the scale from the current spreadsheet                                       |
| Drill         | class, topic, required attempts, max score                                                                                | Required attempts defaults to the class setting and can be overridden per drill                                       |
| Drill attempt | drill, student, attempt number, date, score, note                                                                         | A blank attempt means the student did not take it, not a zero                                                         |

The weight preset dropdown appears when creating a class. Teachers can also save the weights they set on an existing class as a new preset.

## School year and terms

The school year is divided into terms, and each term starts afresh while the year keeps a total.

- **Configurable terms:** the teacher chooses how many terms there are, their names and their date ranges, starting from a template (trimesters, semesters, quarters or full year) or a custom setup. Trimesters can be saved as the teacher's default.
- **Automatic placement:** assignments, daily participation scores and drills are placed in a term by their date. The teacher can move one to a different term.
- **Term grade:** the grading engine runs on that term's scores only, so every term starts from a clean slate.
- **Year grade:** the weighted average of the term grades. Weights default to equal and are configurable (for example 30 / 30 / 40). A term with no scores yet is skipped.
- **Display:** the gradebook has a term selector with a "Year" view beside it. The current term is selected by date.
- **Term settings:** categories, weights, grade scale and late policy are copied from the previous term when a term begins. Editing weights changes the current term only, unless the teacher chooses "apply to all terms", because silently changing past grades would be a surprise.
- **Student transfers:** scores follow the student. When a student moves to another class, the teacher chooses "Transfer student", and the app moves that student's scores for the school year into the new class's gradebook, keeping titles, dates and statuses. Categories are matched by name, and the teacher is asked to map any that do not match. Drills move with the student, the old seat is cleared, and the old class keeps a grayed "transferred out" row with the date. The new class's grade includes the transferred scores, each labeled with its source class.

**Year rollover.** At the start of a new school year, a "Start new school year" wizard sets up the classes without retyping anything:

1. **Create the year:** name it and choose its terms, by default the same as last year's.
2. **Copy class setup:** for each class from last year, the teacher creates a new class (new name and grade level) that copies the categories, weights, grade scale, late policy, drill length, term weights and notification overrides. The seating layout can be copied too, as desks only with no students. It is on by default and can be unticked.
3. **Choose the roster:** for each new class the teacher picks one of three options: start empty, copy last year's students as they are (for a class that repeats), or **graduate** students into it.
4. **Graduate students:** the teacher sees last year's roster with a destination dropdown beside each student, filled in with the next grade level's class by default. Everyone is selected by default, and the teacher can untick a student (for example, one who is repeating the grade) or leave the destination blank for students who are leaving, such as the oldest grade. Students keep their name, parent emails and photo. Their scores and drills stay in last year's class.
5. **Review and confirm:** a summary lists how many classes will be created and how many students will move, stay or be archived. Nothing is applied until the teacher confirms.

Students with no destination are marked inactive. They are hidden from the roster list by default, kept for records, and can be deleted permanently at any time.

Last year's classes are archived read-only: gradebooks, term and year grades, and drill reports can still be viewed, printed and exported. Rollover never deletes data, so a mistake can be fixed by archiving the new class and restoring the old one.

## Grading engine

The engine is a pure, unit-tested function: given a class's configuration and a student's scores, it returns category scores, a weighted total and a letter. No UI or database code lives inside it.

1. **Category score** is the average of the student's counted scores in that category, each assignment weighted equally.
2. **Excused** scores are ignored in the average, as if the assignment did not exist for that student.
3. **Missing** scores count as 0 by default. A cell that has not been entered yet is ignored, so a teacher can enter grades gradually.
4. **Extra credit:** scores above 100% are allowed (the spreadsheet has quiz scores of 104).
5. **Weighted total** is the sum of each category's weight times its score, divided by the sum of the weights of categories that have at least one counted score. An empty category therefore does not drag the total to zero or cause an error. The configured weights themselves never change: with weights of 30 / 20 / 20 / 30 and no test scores yet, the total is computed over the 70 points of weight that have scores.
6. **Weights** are entered as percentages and must add up to 100 before a class is saved. Teachers can use any number of categories.
7. **Letter grade:** the highest scale row whose minimum is at or below the total. The scale is fully editable (rows, minimums, letters), and can be saved and reused.
8. **Rounding** is configurable per class: nearest whole number (default), one decimal place, or two decimal places. The total is rounded before the letter lookup, so 89.6 becomes 90 and earns an A- (only the final total is rounded; scores and category averages are never rounded along the way).
9. **Low-score highlight:** values below a threshold set per class (default 70) are shown in red. The same threshold applies to every score, category average and total in the class's gradebook; there are no per-category thresholds. Highlighting is a display rule, not part of the grading engine.
10. **Participation** is a "daily score" category: each day gets a score on a teacher-set scale (the spreadsheet uses 1 to 5), averaged and converted to a percentage (the spreadsheet multiplies by 20).
11. **Assignment adjustment:** not part of v1. A flat adjustment to every score on one assignment (the spreadsheet notes "8A -1 everyone" on a test) and curves may be included in a later version.

**Dropped scores, retakes and statuses**

- **Excused and Dropped:** both remove a score from the average. The teacher can mark any single score Dropped by hand, with the same effect as Excused. The only difference is the label, so the teacher remembers why: Excused shows "EX", and Dropped shows the score struck through.
- **Best of two attempts:** an assignment can have a second attempt. The higher of the two is counted, and both are shown.
- **Drop the lowest N:** each category has a setting, default 0, that leaves out each student's lowest N counted scores in the term. These appear struck through and labeled "dropped automatically" so they are distinct from manual drops. The engine never drops a student's only remaining score. A missing score counts as 0, so it can be dropped like any other score.
- **Order of rules:** Excused and Dropped scores are removed first, then the best of two attempts is chosen, then the lowest N are dropped.
- **Equal weighting inside a category:** every assignment in a category counts the same. To weight big tests more, the teacher creates another category, such as Major Tests, with its own weight.

Default grade scale, taken from the spreadsheet:

| Minimum % | Letter |
| --------- | ------ |
| 97        | A+     |
| 93        | A      |
| 90        | A-     |
| 87        | B+     |
| 83        | B      |
| 80        | B-     |
| 77        | C+     |
| 73        | C      |
| 70        | C-     |
| 65        | D      |
| 0         | F      |

Default weights in the system preset are an assumption to confirm: for example Participation 30, Homework 20, Quizzes 20, Tests 30, which matches the 8th grade classes. The 7th grade classes use 40 / 20 / 15 / 25 and would be a second saved preset.

## Late work policy

By default the app does nothing about late work. A teacher can switch a class to automatic deduction, and the app guards against deducting twice.

**Setting (per class):**

- **Do nothing** (default): marking a score late only labels it.
- **Deduct automatically:** the teacher sets a number of percentage points (10 points turns a 90 into an 80). The app subtracts it when a score is marked late. The score is floored at 0.

**Avoiding a double deduction.** A teacher may already have lowered the grade by hand before entering it. The workflow is:

1. Each score stores two values: the **original score** the teacher typed, and the **final score** after any late deduction. The grid shows both when they differ, for example "85 -> 75 (late -10 points)", so nothing changes silently.
2. The first time a teacher marks a score late under an automatic policy, a dialog asks: "Is 85 the original grade, or has the late penalty already been taken off?"
3. The choices are **Original: apply the 10-point deduction** and **Already deducted: keep 85**.
4. A checkbox, "Remember my answer for this class", sets one of three behaviors: always ask (default), always treat entered scores as original, or always treat them as already deducted. It can be changed later in class settings.
5. A teacher can undo the deduction on any score with one click, which restores the original score.

When the policy is changed later, it applies only to scores marked late afterward. A separate "recalculate existing late scores" button applies the new rule to old ones, after a confirmation that shows how many scores and grades will change.

## Drills

A drill is a topic students practice several times, with each score saved so they can watch themselves improve.

**Naming:** in the app this feature is called **Practice sets** by default, and a teacher can rename it in settings (for example back to Drills, or Exercises). Every screen, report and email uses the chosen label. This spec says "drill" for short.

- **Attempts, not days.** A drill requires N attempts, which need not fall on consecutive school days. N defaults to 3, is set per class, and can be overridden per drill because it can depend on the topic (some teachers prefer 4 or 5). Teachers can add an extra attempt to a drill later.
- **Entry grid.** Rows are students, columns are attempts, and each attempt has a date. A blank cell means the student did not take that attempt and appears as a gap in progress charts, not as a zero.
- **Notes.** Each student can have a short note, such as "Came late day 2" or "Good for you for taking it home!".
- **Progress.** Each student gets a small line chart (the spreadsheet's sparkline) across their attempts, plus a change indicator comparing the latest attempt to the first. Each attempt column shows the class average.
- **Separate from grades.** As in the spreadsheet, drill scores do not feed the class grade in v1. Drills never count toward grades.
- **History.** All of a class's drills are kept and listed by topic and date, so earlier drills can be reopened and reprinted.

## Drill reports: print and email

In the spreadsheet, pasting a drill table into the DR tab fills the report tables above it, and the teacher prints one class and cuts the page into strips. The app keeps that workflow and adds email.

**Printable strips**

- The teacher picks a class and a drill and opens the report view, which shows one card per student: name, drill topic, each attempt's date and score, the progress chart and the note.
- The page is laid out for printing: cards sit in a grid with dashed cut lines, on Letter paper by default. Teachers can choose how many strips fit per page, and whether to include the class average.
- Printing uses the browser's print dialog with print-specific styling, so there is no extra PDF software. A "download PDF" button is a later addition.
- The report updates automatically as soon as drill scores are entered, with no separate step.

**Several topics on one strip**

- The default is one drill topic per strip. In the report view the teacher can select any number of the class's drills, up to all of them, and each strip then shows a block per topic with its own scores and progress chart.
- Strips grow taller as topics are added, so fewer fit on a page. The preview shows the page count before printing. The same option applies to email.

**Email to parents**

- Each student can have one or more parent email addresses.
- The teacher previews a student's report, edits the note if needed, and sends it. "Send to all" sends one separate email per student, and an email never shows another student's data.
- The email contains the same card as the printed strip, built in HTML so it displays without attachments, and a short customizable message.
- A sent log records who received which report and when, and failed deliveries are flagged. "Send test to me" sends a copy to the teacher first.
- Delivery goes through a transactional email service rather than a personal mailbox.

## Seating charts

Each class can optionally have a seating chart: a simple top-down diagram of the room where the teacher places desks and seats students without typing names.

**Layout**

- Desks sit on a grid of rows, and each column is split in half. A desk can sit directly under a desk in the previous row, or exactly halfway between two desks. Nothing else is allowed: no quarter positions, no free dragging and no rotation.
- A "stagger this row" button shifts a whole row by half a desk, so the common brick pattern takes one click.
- The teacher adds, removes and moves desks by clicking or dragging, with a mouse or by touch; each move snaps to the grid. Undo and redo are supported.
- A "front of room" label marks the top of the chart, and the teacher can flip it to another side to match the room.
- A class can keep several charts, since seating changes during the year (for example, one per quarter). One is marked current.

**Seating students**

- Clicking a desk opens a searchable dropdown of the class roster, so no names are typed by hand. Students already seated are marked in the list, and a side list shows who still has no seat.
- If the student has a photo, it appears on the desk beside the name. Otherwise the desk shows initials.
- A name that is not in the roster can be typed in, for a new student who has not been registered yet. It is saved as a **guest name** on that desk only, with no grades or drills attached. A banner then reads "1 unregistered name" and offers to create a real student record from it in one click, which links the seat to the new student.
- Moving a student to another desk swaps if the target desk is taken, after a confirmation.
- If a student leaves the class, their desk becomes empty and the teacher is told.

**Photos**

- Photos are optional and added on the student's profile: upload, crop to a square, replace or delete.
- They are visible only to the teacher. Printed seating charts include photos only if the teacher chooses to, and emails never include them.
- Deleting a student deletes the photo.

**Printing.** The chart prints on one page, landscape, with names (and photos if chosen) and the front-of-room label.

**Data added to the model**

| Entity        | Key fields                                                                      |
| ------------- | ------------------------------------------------------------------------------- |
| Student       | photo (optional), added to the existing fields                                  |
| Seating chart | class, name, current flag, front side                                           |
| Desk          | chart, row, position in half columns, student (optional), guest name (optional) |

## Attendance

Teachers record attendance for each class meeting and can review the history for a whole class or for one student.

**Taking attendance**

- Each student is marked **Present**, **Late****, Absent (excused) or Absent (unexcused). Absent defaults to unexcused and can be changed to excused later, for example when a note arrives**. The roll screen starts with everyone Present, so the teacher only changes the exceptions, and there is a "mark all present" button. Each status is one tap, which works on a tablet.
- If the class has a seating chart, the teacher can take attendance on it: tapping a desk cycles through Present, Late and Absent (unexcused), and the teacher marks an excused absence from the desk's menu.
- Each record can carry a short note, such as "arrived at 9:20".
- Attendance is recorded per date. A date with no attendance taken is shown as "not taken", never as present, so days without class do not count against anyone.
- Past dates can be opened and corrected at any time.
- Only registered students can be marked. A guest name on the seating chart shows a prompt to register the student first.

**Viewing history**

- **Class history:** a grid with students as rows and dates as columns, each cell showing P, L, AE (excused absence) or AU (unexcused absence) with a color. It can be filtered by term or date range. Each date shows its totals, and each student row shows present, late, excused absence and unexcused absence counts and an attendance rate.
- **Student history:** a list of every recorded date with the status and note, plus totals per term and for the year. It is also reachable from the student's profile.
- **Attendance rate:** the share of recorded days a student attended. By default Late counts as attended, and this can be changed in settings. Excused and unexcused absences are treated the same in the rate for now: the distinction is recorded and shown, and has no other effect.
- Both views can be printed and exported to CSV.

**How it connects to the rest of the app**

- Attendance is separate from the daily participation score, which stays a graded category. It is also separate from late work, which concerns assignments, not arrival.
- Attendance records move with a student who transfers to another class, and they are archived with the class at year rollover.
- Attendance is visible only to the teacher, and parents are not emailed about it in v1.

| Entity            | Key fields                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Attendance record | class, student, date, status (present, late, excused absence, unexcused absence), note. One record per student per class per date |

## Missing-work lists

The app already knows which scores are missing, so it can produce a list for students and parents.

- **Per student:** every assignment marked missing in the chosen term, with title, category, due date and points. Excused and Dropped scores are not listed. When a score is entered later, the item leaves the list on its own.
- **Per class:** a view of who is missing what, grouped by student or by assignment.
- **Printing:** one list per student, with students who have nothing missing skipped by default. Teachers can print one student's list or the whole class's. The heading line can be customized (for example "Please hand these in").
- **Email to parents:** the same flow as drill reports: preview, send one or all, and a sent log. Only students with missing work get an email, and an email never shows another student's data.
- **Late policy:** if the class deducts points for late work, the list says so beside each item, so families know what to expect.

## Final grade comments

Each student can have one comment per term, attached to their term grade and shown beside it in the grades view.

- **Writing a comment:** the teacher types it directly, or clicks "Suggest a comment". For a suggestion, the teacher writes a short prompt describing the student and their effort, such as "works hard, struggled with fractions early, improving, chatty in class". The app returns a polished comment of two to four sentences. The teacher can choose the tone (warm, neutral or formal) and length (short or medium), ask for another version, and edit freely. Nothing is saved or sent until the teacher saves it.
- **Privacy:** the student's name is never sent to the AI. The prompt goes with a placeholder that the app replaces with the name on the teacher's screen. No grades, attendance or other student data are sent unless the teacher explicitly adds the grade to the prompt. The request is made from the server using a hosted language model API, so the key never reaches the browser.
- **No pronouns:** the app stores no pronouns, and suggestions use the student's name or neutral wording unless the teacher's own prompt uses pronouns.
- **Output:** comments can be printed as one class sheet and exported to CSV.

| Entity        | Key fields                 |
| ------------- | -------------------------- |
| Final comment | class, student, term, text |

## Needs-attention notifications

The app flags students who may need help. Each rule can be turned on or off in Settings and has its own threshold. Defaults are set once and can be overridden per class.

| Rule              | Fires when                                                                                                                         | Default      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Low grade         | The student's term grade is below the threshold                                                                                    | Below 70     |
| Missing work      | The student has N missing assignments in a row, by date, skipping excused and dropped ones                                         | 2 in a row   |
| Sharp drop        | The term grade has fallen by at least N points compared with 14 days earlier                                                       | 10 points    |
| Frequent absences | The student has N absences within a set number of days. Excused absences count by default, and a setting can limit it to unexcused | 3 in 30 days |
| Frequent lateness | The student has been marked Late N times within a set number of days                                                               | 3 in 30 days |

- Notifications appear in the app only, for the teacher only: a bell with a count, and a list grouped by class that shows the student, the rule and the numbers behind it.
- Each notification can be dismissed, snoozed or opened. A rule does not fire again for the same student until the condition has cleared and then happens again.
- Rules are checked whenever scores change. To avoid early-term noise, low-grade and sharp-drop rules wait until a student has a minimum number of scored assignments in the term (default 3).
- A master switch turns all notifications off. Email or digest delivery is not part of v1.

## Import and export

Teachers should not have to retype data they already have in Excel.

- **Roster import:** upload a CSV of student names and parent emails.
- **Gradebook paste and CSV import:** the same parse-and-preview flow for assignment scores.
- **Cell clean-up:** text in score cells is mapped on import. "ex" becomes Excused, blanks stay not-entered, and anything else non-numeric (such as "100?" or "\<copy") is flagged for the teacher to fix instead of being silently dropped.
- **Workbook import:** a guided import of a whole .xlsx like the current one is a later phase, because the layout of that workbook (students in columns on the grade tabs, in rows elsewhere) needs per-sheet mapping.
- **Export:** gradebook and drill data can be exported to CSV at any time, so teachers are never locked in.

## Non-functional requirements and tech stack

**Privacy and safety.** The app stores student names, grades and parent emails, so it needs real accounts, per-teacher data isolation, HTTPS, hashed passwords, and a way to delete a class or an account permanently. The public demo uses only invented students. The real spreadsheet and its student names stay out of the repository.

**Quality bar.** Unit tests on the grading engine (including every rule in the engine section), end-to-end tests for the main flows, CI on every push, a responsive, tablet-friendly layout (touch drag for the seating chart), keyboard-accessible grids, and a README with screenshots and a live link.

**Proposed stack (open to change):**

| Layer        | Choice                                                 | Why                                                          |
| ------------ | ------------------------------------------------------ | ------------------------------------------------------------ |
| Front end    | React with TypeScript                                  | Widely recognized by employers                               |
| Back end     | Node with TypeScript (or Next.js full stack)           | One language end to end, shared types for the grading engine |
| Database     | PostgreSQL via an ORM such as Prisma                   | Relational fit for classes, students and scores              |
| Auth         | Email and password with sessions, or a hosted provider | Keeps accounts secure without custom crypto                  |
| Email        | A transactional provider such as Resend or SendGrid    | Reliable delivery and logs                                   |
| Charts       | A small chart library or hand-drawn SVG                | Needed for per-student sparklines                            |
| Tests and CI | Vitest, Playwright, GitHub Actions                     | Standard and visible to reviewers                            |

The grading engine lives in its own shared package so the front end can preview grades instantly and the server can verify them.

## Phased build plan

Each phase ends with something that runs and can be demonstrated. Phases 1 to 3 produce a working gradebook that replaces the spreadsheet, and the later phases follow the priorities below.

1. **Grading engine:** the pure, unit-tested grading code with no database: category averages, statuses, retakes, drop-lowest, weights, renormalizing, rounding, letter lookup, late deductions, term and year grades.
2. **Foundations:** project setup, database with migrations, accounts, classes, students (kept separate from their class enrollment), school years with configurable terms, categories and weights, saved weight presets, and an editable grade scale.
3. **Gradebook:** the score-entry grid, excused / dropped / missing / late statuses, best-of-two retakes and drop-lowest rules, the late policy and its confirmation dialog, term and year grades with letters, low-score highlighting. Deploy a live version at the end of this phase and keep it live. This is the point where the app replaces the spreadsheet.
4. **Practice sets (drills):** configurable attempts, the entry grid, progress charts, and printable per-student reports with the option to include several topics.
5. **Attendance:** the roll screen, class and student history, excused and unexcused absences.
6. **Teacher helpers:** missing-work lists, needs-attention notifications with their settings, and final grade comments with AI suggestions.
7. **Seating charts:** the half-step desk grid, dropdown seating, guest names, student photos, touch drag.
8. **Email to parents:** parent addresses, preview, send one or all, sent log, for practice-set reports and missing-work lists.
9. **Rollover, import and polish:** year rollover with the option to graduate students, roster and gradebook CSV import, export, demo data, README, screenshots.
10. **Later:** rubrics, flat adjustments and curves, workbook import, PDF download of reports, and the Daily Roll printable page.

**Priority by feature**

| Priority                         | Features                                                                                                                                                                                                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Must have (first usable version) | Accounts, classes and students, configurable categories, weights and grade scale, saved weight presets, terms and year grades, gradebook entry grid, excused / dropped / missing / late statuses, practice sets with printable per-student reports, attendance |
| Next                             | Retakes and drop-lowest, automatic late deduction with its dialog, missing-work lists, needs-attention notifications, final grade comments with AI suggestions                                                                                                 |
| After that                       | Seating charts with photos, email to parents, year rollover, CSV import and export                                                                                                                                                                             |
| Later                            | Rubrics, adjustments and curves, workbook import, PDF download, Daily Roll                                                                                                                                                                                     |

## Decisions

All questions are answered, and each decision is built into the spec above.

1. **Late deduction math:** deducting 10% means 10 percentage points off the score (90 becomes 80). The default is percentage points, as confirmed.
2. **Missing work:** a score marked missing counts as 0 by default. Confirmed.
3. **Empty categories:** a category with no scores yet is skipped in the total, and the configured weights stay unchanged. Confirmed.
4. **Participation:** participation is a daily 1 to 5 score converted to a percentage, as a "daily score" category type. Confirmed.
5. **Drills and grades:** drills never count toward grades. Confirmed.
6. **Rounding:** totals are rounded before the letter lookup, which changes the earlier default of no rounding.
7. **Per-assignment adjustments:** not in v1. Flat adjustments and curves may be included in a later version.
8. **Students and parents:** print and email are enough for v1, with no logins. Confirmed.

Added after the second review:

- **Year grade method:** both a term grade and a year grade are shown. The year grade averages the term grades, equally weighted by default.
- **Year rollover:** decided: rollover copies class setup and offers graduating students to the next grade (see School year and terms).
- **Dropping lowest N:** missing work can be dropped automatically, like any other score. Confirmed.
- **Transfers:** categories are matched by name and the teacher is asked about any that differ. Confirmed as enough.

## Notes for later versions

**Rubrics:** rubric grading for writing, projects and presentations, with criteria and levels that convert to a percentage for a category. We would like to develop it at a later stage. It is not part of v1.

We would like to revisit the Daily Roll printable page feature. In the spreadsheet it is a printable sheet, one block per class, with On time / Late / Participation columns for Math and for Word Problems, plus a notes column. It is intentionally left out of v1. Attendance is now a v1 feature of its own, so revisiting this page will decide how it fits alongside it.
