import { currentUser, ROLES } from './constants';

// Helper functions for role checking
export const canCreateTask = () => currentUser.role === ROLES.ADMIN;
export const canAssignTask = () => currentUser.role === ROLES.ADMIN;
export const canCreateGoal = () => currentUser.role === ROLES.ADMIN;
export const canCreateMeeting = () => currentUser.role === ROLES.ADMIN;
export const canUploadMinutes = () => currentUser.role === ROLES.ADMIN;
export const canViewUsers = () => currentUser.role === ROLES.ADMIN;
export const canEditDueDate = () => currentUser.role === ROLES.ADMIN;
export const canReassignTask = () => currentUser.role === ROLES.ADMIN;

// What EXEC can do
export const canUpdateTaskStatus = () => true; // Both roles can do this
export const canViewTasks = () => true;
export const canViewGoals = () => true;
export const canViewMeetings = () => true;
export const canViewMinutes = () => true;