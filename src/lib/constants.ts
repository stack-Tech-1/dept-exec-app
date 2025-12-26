// EXACTLY as specified in step 1
export const ROLES = {
    ADMIN: "ADMIN",
    EXEC: "EXEC",
  } as const;
  
  // Mock user as specified
  export const currentUser = {
    name: "Precious Adetipe",
    role: "ADMIN", // change to EXEC to test
  };