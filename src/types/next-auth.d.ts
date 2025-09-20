// NextAuth type definitions disabled to avoid import issues
// These types are now handled by our custom auth context

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'Admin' | 'Manager' | 'Clerk';
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Clerk';
}