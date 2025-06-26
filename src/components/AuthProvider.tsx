'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // users 테이블에서 프로필 fetch
  const fetchUserProfile = async (uid: string, email: string) => {
    try {
      // users 테이블에서 id로 조회
      const { data: userRow, error } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', uid)
        .single();
      
      if (userRow) return userRow as User;
      
      // row가 없으면 생성
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ id: uid, email, role: 'user', created_at: new Date().toISOString() }])
        .select()
        .single();
      
      if (insertError) {
        console.error('users 테이블 생성 실패:', insertError);
        return null;
      }
      
      return newUser as User;
    } catch (error) {
      console.error('fetchUserProfile 에러:', error);
      return null;
    }
  };

  // 세션 복원 및 users fetch
  useEffect(() => {
    let mounted = true;
    
    async function syncUser() {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const userProfile = await fetchUserProfile(session.user.id, session.user.email);
          if (mounted) {
            setUser(userProfile);
            console.log('AuthProvider - 세션 복원 성공:', userProfile);
          }
        } else if (mounted) {
          setUser(null);
          console.log('AuthProvider - 세션 없음');
        }
      } catch (error) {
        console.error('syncUser 에러:', error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    
    syncUser();
    
    // onAuthStateChange 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider - onAuthStateChange:', event, session?.user?.id);
      
      if (session?.user && mounted) {
        const userProfile = await fetchUserProfile(session.user.id, session.user.email);
        if (mounted) {
          setUser(userProfile);
          setIsLoading(false);
          console.log('AuthProvider - 로그인 성공:', userProfile);
        }
      } else if (mounted) {
        setUser(null);
        setIsLoading(false);
        console.log('AuthProvider - 로그아웃');
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // 로그인 후 users fetch
      if (data.user) {
        const userProfile = await fetchUserProfile(data.user.id, data.user.email);
        setUser(userProfile);
        console.log('AuthProvider - 로그인 완료:', userProfile);
      }
    } catch (error) {
      console.error('login 에러:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      console.log('AuthProvider - 로그아웃 완료');
    } catch (error) {
      console.error('logout 에러:', error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log('AuthProvider 렌더링:', { user, isLoading });

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