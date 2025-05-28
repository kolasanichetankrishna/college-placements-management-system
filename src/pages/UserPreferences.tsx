
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Preference } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Save, Settings } from 'lucide-react';

const UserPreferencesPage: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Preference>({
    id: '',
    userId: '',
    notificationEmail: true,
    darkMode: false,
    language: 'en'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const prefDocRef = doc(db, 'preferences', user.id);
        const prefDoc = await getDoc(prefDocRef);
        
        if (prefDoc.exists()) {
          setPreferences({ 
            id: prefDoc.id, 
            ...prefDoc.data() 
          } as Preference);
        } else {
          // Initialize with defaults
          const defaultPrefs: Preference = {
            id: user.id,
            userId: user.id,
            notificationEmail: true,
            darkMode: false,
            language: 'en'
          };
          setPreferences(defaultPrefs);
          // Save defaults to database
          await setDoc(prefDocRef, defaultPrefs);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
        toast.error('Failed to load preferences');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const handleSavePreferences = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const prefDocRef = doc(db, 'preferences', user.id);
      await setDoc(prefDocRef, preferences);
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-center">
          <p className="text-muted-foreground">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Preferences</h1>
        <p className="text-muted-foreground">
          Customize your application settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Settings
          </CardTitle>
          <CardDescription>
            Configure how the application works for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notificationEmail" className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email notifications about important events</p>
              </div>
              <Switch 
                id="notificationEmail" 
                checked={preferences.notificationEmail}
                onCheckedChange={(checked) => setPreferences({...preferences, notificationEmail: checked})}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="darkMode" className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <Switch 
                id="darkMode" 
                checked={preferences.darkMode}
                onCheckedChange={(checked) => setPreferences({...preferences, darkMode: checked})}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="language" className="text-base">Language</Label>
                <p className="text-sm text-muted-foreground">Choose your preferred language</p>
              </div>
              <Select 
                value={preferences.language}
                onValueChange={(value) => setPreferences({...preferences, language: value as 'en' | 'hi' | 'te' | 'ta'})}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSavePreferences} disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center gap-2">Saving...</span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPreferencesPage;
