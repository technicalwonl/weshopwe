import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AppRole = 'admin' | 'user' | 'moderator' | 'super_admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userRole: AppRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('🔍 [AuthContext] Fetching role for userId:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [AuthContext] Error fetching role:', error);
        return null;
      }

      const roles = (data || []).map((r) => r.role as AppRole);
      console.log('📋 [AuthContext] Raw roles from DB:', roles);

      const roleHierarchy: Record<AppRole, number> = {
        super_admin: 4,
        admin: 3,
        moderator: 2,
        user: 1,
      };

      const highestRole = roles.reduce<AppRole>(
        (best, role) => (roleHierarchy[role] > roleHierarchy[best] ? role : best),
        'user'
      );

      console.log('👑 [AuthContext] Determined highest role:', highestRole);
      return highestRole;
    } catch (error) {
      console.error('❌ [AuthContext] Error fetching role:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role fetching with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id).then(role => {
              console.log('✅ [AuthContext] Role set for user', session.user.email, '-> role:', role);
              setUserRole(role);
              setLoading(false);
            });
          }, 0);
        } else {
          console.log('🚪 [AuthContext] No session, clearing role');
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id).then(role => {
          setUserRole(role);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        const role = await fetchUserRole(data.user.id);
        setUserRole(role);
        toast.success('Welcome back!');
        return true;
      }

      return false;
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        toast.success('Account created successfully!');
        return true;
      }

      return false;
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
      toast.info('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    }
  };

  const checkRole = (role: AppRole): boolean => {
    if (!userRole) {
      console.log('❌ [AuthContext] checkRole failed: no userRole');
      return false;
    }
    
    const roleHierarchy: Record<AppRole, number> = {
      'super_admin': 4,
      'admin': 3,
      'moderator': 2,
      'user': 1,
    };

    const result = roleHierarchy[userRole] >= roleHierarchy[role];
    console.log(`🔐 [AuthContext] checkRole(${role}) for currentRole(${userRole}): ${result}`);
    return result;
  };

  const isAdmin = userRole === 'admin' || userRole === 'super_admin' || userRole === 'moderator';
  console.log('👑 [AuthContext] isAdmin:', isAdmin, '(userRole:', userRole, ')');

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isAdmin,
        userRole,
        loading,
        login,
        signup,
        logout,
        checkRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
