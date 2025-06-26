'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 세션 복원 및 사용자 정보 fetch
    const session = supabase.auth.getSession();
    session.then(async ({ data }) => {
      if (data.session) {
        const { user: supaUser } = data.session;
        // users 테이블에서 role 조회
        const { data: userRow } = await supabase
          .from('users')
          .select('id, email, role, name')
          .eq('email', supaUser.email)
          .single();
        if (userRow) {
          setUser(userRow as User);
          localStorage.setItem('user', JSON.stringify(userRow));
        } else {
          setUser({
            id: supaUser.id,
            email: supaUser.email,
            role: 'user',
            name: supaUser.user_metadata?.name || ''
          });
          localStorage.setItem('user', JSON.stringify({
            id: supaUser.id,
            email: supaUser.email,
            role: 'user',
            name: supaUser.user_metadata?.name || ''
          }));
        }
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // users 테이블에서 role 조회
    const { data: userRows } = await supabase
      .from('users')
      .select('id, email, role, name')
      .eq('email', email)
      .single();
    if (userRows) {
      setUser(userRows as User);
      localStorage.setItem('user', JSON.stringify(userRows));
    } else {
      // users 테이블에 row가 없으면 기본 user로 생성
      const { data: newUser } = await supabase
        .from('users')
        .insert([{ email, role: 'user', created_at: new Date().toISOString() }])
        .select()
        .single();
      setUser(newUser as User);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 