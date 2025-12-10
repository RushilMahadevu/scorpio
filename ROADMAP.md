# Physics Platform (Scorpio) - Sequential Feature Roadmap

A realistic, solo-developer feature plan for gradual improvement.

---

## Feature Sequence

- [x] Fix any existing bugs in assignment creation/submission flow
- [ ] Add assignment deadline warnings (show "due soon" badges)
- [ ] Improve AI tutor response formatting with better markdown rendering
- [x] File Attachments: Let students attach PDFs/images to submissions
- [x] Draft Assignments: Save assignments as drafts before publishing
- [ ] Better Math Input: Improve the KaTeX equation editor UX
- [ ] Delete Functionality: Allow deleting assignments and submissions
- [ ] Edit Assignments: Teachers can edit published assignments
- [ ] Loading states for all AI interactions
- [ ] Better error messages (user-friendly, not technical)
- [ ] Toast notifications for actions (assignment created, submitted, etc.)
- [ ] Confirm dialogs for destructive actions (delete, etc.)
- [ ] Assignment templates (common problem types)
- [ ] Multiple choice questions with auto-grading
- [ ] Clone/duplicate assignments
- [ ] Assignment categories/tags for organization
- [ ] Bulk actions (delete multiple, publish multiple)
- [ ] Add comments when grading (not just a score)
- [ ] Partial credit support
- [ ] Grade history (track revisions)
- [ ] Export grades to CSV
- [ ] Assignment calendar view
- [ ] Filter assignments by status (pending, submitted, graded)
- [ ] Progress bar (% of assignments completed)
- [ ] Email notifications for grades (optional)
- [ ] Save chat history per assignment
- [ ] "Ask about this problem" button on assignments
- [ ] Show working/step-by-step for solutions
- [ ] Limit hints before revealing full solution
- [ ] Resource library (teachers upload PDFs, videos, links)
- [ ] Organize resources by topic/unit
- [ ] Students can bookmark resources
- [ ] Search across assignments and resources
- [ ] Announcement system (post messages to entire class)
- [ ] Comment threads on assignments
- [ ] Mark announcements as important/pinned
- [ ] Teacher dashboard: class average, completion rate
- [ ] Student dashboard: personal grade average, pending work
- [ ] Simple charts (grades over time, assignment difficulty)
- [ ] Identify struggling students (< 70% average)
- [ ] Keyboard shortcuts for common actions
- [ ] Improved mobile responsive design
- [ ] Print-friendly assignment view
- [ ] Dark mode improvements
- [ ] Rubric builder (define criteria with point values)
- [ ] Grade multiple submissions on same page
- [ ] Return submissions for revision (resubmit feature)
- [ ] Late submission penalties (auto-deduct points)
- [ ] AI suggests similar problems for practice
- [ ] AI-generated practice quizzes
- [ ] Detect common misconceptions in answers
- [ ] Difficulty rating for problems (AI-powered)
- [ ] Study mode: unlimited practice problems
- [ ] Track time spent on assignments
- [ ] Personal notes on assignments (only student sees)
- [ ] Favorite/bookmark assignments
- [ ] Optimize database queries
- [ ] Add caching for common data
- [ ] Image compression for uploads
- [ ] Lazy loading for long lists
- [ ] Timed quizzes/tests
- [ ] Question bank (reusable problems)
- [ ] Randomize question order for tests
- [ ] Formula reference sheet builder
- [ ] Class discussion forum (Q&A board)
- [ ] Students can help each other (optional feature)
- [ ] Teacher can pin helpful student responses
- [ ] Multi-step problems (linked questions)
- [ ] Unit/module organization
- [ ] Prerequisites (unlock assignments in order)
- [ ] Achievement badges for milestones
- [ ] Comprehensive user testing
- [ ] Accessibility audit (keyboard nav, screen readers)
- [ ] Performance optimization pass
- [ ] Bug fixes and stability improvements

---

## Future Ideas

- [ ] Mobile app (iOS/Android)
- [ ] Video lessons integration
- [ ] Physics simulations (embed PhET or similar)
- [ ] Parent view (read-only access to student progress)
- [ ] Multi-class support (students in multiple classes)
- [ ] Google Classroom integration
- [ ] Peer review system
- [ ] Advanced analytics (learning patterns, concept mastery)
- [ ] Gamification (points, leaderboards - optional)
- [ ] LaTeX equation image recognition
- [ ] Voice input for AI tutor

---

## Technical Debt to Address

- [ ] Add proper error boundaries
- [ ] Implement comprehensive logging
- [ ] Write unit tests for critical functions
- [ ] Set up automated backups
- [ ] Add rate limiting for AI calls
- [ ] Document API endpoints
- [ ] Refactor large components into smaller ones
- [ ] Set up monitoring/alerts for errors

---

## Guiding Principles

1. Ship small, ship often: Release working features incrementally
2. User feedback first: Prioritize what users actually need
3. Keep it simple: Don't over-engineer solutions
4. Stability > features: Fix bugs before adding new stuff
5. One feature at a time: Finish what you start
6. Mobile-friendly: Always test on phone/tablet
7. Performance matters: Keep load times under 2 seconds

---

*Last Updated: December 9, 2025*