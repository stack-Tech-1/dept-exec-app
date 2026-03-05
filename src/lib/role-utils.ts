import { ROLES } from './constants';
import { authService } from '@/services/auth';

// Helper functions for role checking
const getCurrentUserRole = () => authService.getCurrentUser()?.role;

export const canCreateTask = () => getCurrentUserRole() === ROLES.ADMIN;
export const canAssignTask = () => getCurrentUserRole() === ROLES.ADMIN;
export const canCreateGoal = () => getCurrentUserRole() === ROLES.ADMIN;
export const canCreateMeeting = () => getCurrentUserRole() === ROLES.ADMIN;
export const canUploadMinutes = () => getCurrentUserRole() === ROLES.ADMIN;
export const canViewUsers = () => getCurrentUserRole() === ROLES.ADMIN;
export const canEditDueDate = () => getCurrentUserRole() === ROLES.ADMIN;
export const canReassignTask = () => getCurrentUserRole() === ROLES.ADMIN;

// What EXEC can do
export const canUpdateTaskStatus = () => true; // Both roles can do this
export const canViewTasks = () => true;
export const canViewGoals = () => true;
export const canViewMeetings = () => true;
export const canViewMinutes = () => true;