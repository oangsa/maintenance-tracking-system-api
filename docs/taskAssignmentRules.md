# Database Schema — Task Assignment Details

This document expands the brief Task Assignment notes in `docs/databaseSchema.md` and describes the current database-backed behavior in human-readable form.

## Current database behavior

The database now acts as the final protection layer for task assignment. It enforces the following behavior:

- Only one active assignment can exist for a task at a time.
- Creating a new assignment automatically closes any previous active assignment for the same task.
- Assignment rows must have a valid assigner recorded.
- Assignment end time cannot be earlier than assignment start time.
- Deleted users cannot become assignees.
- Tasks already in a final state cannot receive new assignments.

Because these checks now live in the database, the backend does not need to manually reproduce the close-previous-assignment logic in multiple places.

## Recommended backend mental model

Treat `work_task_assignment` as an append-only history table.

- A new assignment means a new history event.
- The previous active event is closed automatically by the database.
- The current assignee is simply the row that is still open.
- Historical rows remain available for audit, timeline, and reporting needs.

## Service flow

### Assign or reassign task

The backend flow should stay simple:

1. Validate the request payload.
2. Confirm the task exists.
3. Confirm the assignee exists.
4. Optionally short-circuit if the task is already assigned to the same user.
5. Create a new assignment row.
6. Let the database handle automatic closure of the previous active assignment and reject invalid states.

This keeps assignment behavior atomic from the caller perspective.

### Unassign task

For explicit unassign behavior, the backend can still look up the active row and close it by setting its end time.

### Read current assignee

The current assignee is the assignment row for the task that is still active.

### Read assignment history

Assignment history is the full list of rows for the task ordered by assignment time.

## Practical implications for development

- Backend validation is still useful for clearer API errors and earlier feedback.
- Database protections should be treated as the source of truth for race-safe enforcement.
- Assignment creation should be modeled as one logical action, not as separate visible unassign and assign steps.
- Error handling should translate database rejections into meaningful API responses.

## Suggested API behavior

- Assigning to the same active user can be treated as a no-op success.
- Assigning to a deleted user should return a bad request style error.
- Assigning a final task should return a bad request or conflict style error, depending on existing API conventions.

## Summary

Task assignment is now protected both by backend intent and by database enforcement. The backend should remain straightforward, while the database guarantees that active assignment uniqueness, reassignment closure, user validity, task-state validity, and assignment time consistency are all preserved.

# Task Assignment Rules

This document describes the current behavior of task assignment after the database protections were added.

## What the database guarantees

1. Single Active Assignee
- A task can have at most one active assignment at any time.
- An assignment is active when `unassigned_at` is still empty.

2. Automatic Reassignment Handling
- Creating a new assignment automatically ends the previous active assignment for the same task.
- From the backend point of view, reassignment can be treated as one action instead of a manual close-then-create sequence.

3. Assignment History Is Preserved
- Assignment rows remain as history.
- The active row is ended by filling `unassigned_at`; the record itself is not replaced or deleted.

4. Deleted Users Cannot Be Assigned
- The database rejects assignment changes that target a user already marked as deleted.

5. Final Tasks Cannot Be Assigned
- The database rejects new assignments when the related task is already in a final repair status.

6. Assignment Time Must Be Valid
- An assignment can stay open with no end time.
- If it is ended, the end time must not be earlier than the assignment start time.

7. Assignment Ownership Is Mandatory
- Every assignment row must record both the assignee and who assigned it.

8. Self Assignment Is Still Allowed
- The assigner and assignee may be the same user.

## Backend implication

The backend should still validate request input and perform normal existence checks, but the database is now the final safety layer for assignment integrity.

That means the service flow can stay simple:

1. Validate request payload.
2. Ensure the task and assignee exist.
3. Optionally short-circuit if the requested assignee is already active.
4. Create the new assignment record.
5. Let the database handle automatic closure of the previous active row and reject invalid states.

## Practical mental model

- `work_task_assignment` is the source of truth for who is currently responsible for a task.
- Current assignee = the row whose `unassigned_at` is still empty.
- Reassignment = append a new row and let the database close the old active one.
- History stays available for audit and timeline purposes.
