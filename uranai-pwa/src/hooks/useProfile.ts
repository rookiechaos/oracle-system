import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { getProfile, saveProfile } from '../db/queries';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then(p => {
      setProfile(p);
      setLoading(false);
    });
  }, []);

  const updateProfile = useCallback(async (data: Omit<UserProfile, 'id' | 'createdAt'>) => {
    await saveProfile(data);
    const updated = await getProfile();
    setProfile(updated);
  }, []);

  return { profile, loading, updateProfile };
}
