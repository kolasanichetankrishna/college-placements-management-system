
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { GraduationCap, Calendar, Clock, Plus, Search, User } from 'lucide-react';
import { Mentorship } from '@/types';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getStudentMentorships, getMentorMentorships, addMentorship } from '@/lib/firestore';

const MentorshipPage: React.FC = () => {
  const { user } = useAuth();
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [availableMentors, setAvailableMentors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState('');
  
  useEffect(() => {
    const fetchMentorships = async () => {
      setIsLoading(true);
      try {
        if (!user) return;
        
        let mentorshipData: Mentorship[] = [];
        
        if (user.role === 'student') {
          mentorshipData = await getStudentMentorships(user.id);
        } else if (user.role === 'hod' || user.role === 'placement') {
          mentorshipData = await getMentorMentorships(user.id);
        }
        
        if (mentorshipData.length === 0) {
          // Initialize with sample mentorship if none exists
          if (user.role === 'student') {
            const sampleMentorship = await initializeSampleMentorship(user.id);
            if (sampleMentorship) {
              mentorshipData = [sampleMentorship];
            }
          }
        }
        
        setMentorships(mentorshipData);
        
        // Fetch available mentors for students
        if (user.role === 'student') {
          const mentorsRef = collection(db, 'users');
          const mentorsQuery = query(mentorsRef, where('role', 'in', ['hod', 'placement']));
          const mentorsSnapshot = await getDocs(mentorsQuery);
          
          const mentorsList = mentorsSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            department: doc.data().department,
            role: doc.data().role
          }));
          
          setAvailableMentors(mentorsList);
        }
      } catch (error) {
        console.error('Error fetching mentorships:', error);
        toast.error('Failed to load mentorship data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMentorships();
  }, [user]);
  
  const initializeSampleMentorship = async (studentId: string): Promise<Mentorship | null> => {
    try {
      // Find a mentor
      const mentorsRef = collection(db, 'users');
      const mentorsQuery = query(mentorsRef, where('role', 'in', ['hod', 'placement']));
      const mentorsSnapshot = await getDocs(mentorsQuery);
      
      if (mentorsSnapshot.empty) return null;
      
      const mentorDoc = mentorsSnapshot.docs[0];
      const mentorId = mentorDoc.id;
      const mentorName = mentorDoc.data().name;
      
      // Create a sample mentorship
      const newMentorship: Omit<Mentorship, 'id'> = {
        studentId,
        mentorId,
        mentorName,
        status: 'pending',
        startDate: new Date().toISOString(),
        notes: 'Automated mentorship assignment. Please schedule your first session.'
      };
      
      const docRef = await addDoc(collection(db, 'mentorships'), newMentorship);
      
      return {
        id: docRef.id,
        ...newMentorship
      };
    } catch (error) {
      console.error('Error creating sample mentorship:', error);
      return null;
    }
  };
  
  const handleRequestMentorship = async () => {
    if (!selectedMentor || !user) {
      toast.error('Please select a mentor');
      return;
    }
    
    try {
      const mentorDoc = availableMentors.find(mentor => mentor.id === selectedMentor);
      
      if (!mentorDoc) {
        toast.error('Selected mentor not found');
        return;
      }
      
      const newMentorship: Omit<Mentorship, 'id'> = {
        studentId: user.id,
        mentorId: selectedMentor,
        mentorName: mentorDoc.name,
        status: 'pending',
        startDate: new Date().toISOString(),
        notes: 'Requesting mentorship guidance'
      };
      
      const docRef = await addMentorship(newMentorship);
      
      setMentorships([...mentorships, { id: docRef, ...newMentorship }]);
      toast.success('Mentorship request sent successfully');
      setSelectedMentor('');
    } catch (error) {
      console.error('Error requesting mentorship:', error);
      toast.error('Failed to request mentorship');
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mentorship Program</h1>
          <p className="text-muted-foreground">
            {user?.role === 'student'
              ? 'Connect with faculty mentors for career guidance'
              : 'Manage your student mentorships'}
          </p>
        </div>
        
        {user?.role === 'student' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Request Mentor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Request a Mentor</DialogTitle>
                <DialogDescription>
                  Choose a faculty mentor to help guide your career development
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="mentor">Select Mentor</Label>
                  <select 
                    id="mentor" 
                    className="w-full p-2 border rounded-md" 
                    value={selectedMentor}
                    onChange={(e) => setSelectedMentor(e.target.value)}
                  >
                    <option value="">Select a mentor</option>
                    {availableMentors.map(mentor => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.name} ({mentor.role === 'hod' ? 'HOD' : 'Placement Officer'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleRequestMentorship}>Request Mentorship</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-center">
            <p className="text-muted-foreground">Loading mentorship data...</p>
          </div>
        </div>
      ) : mentorships.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mentorships.map(mentorship => (
            <Card key={mentorship.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      {user?.role === 'student' ? mentorship.mentorName : 'Student Mentorship'}
                    </CardTitle>
                    <CardDescription className="text-base font-medium mt-1">
                      {mentorship.status === 'active' ? 'Active Mentorship' : 
                       mentorship.status === 'pending' ? 'Pending Approval' : 'Completed'}
                    </CardDescription>
                  </div>
                  <Badge variant={
                    mentorship.status === 'active' ? 'default' :
                    mentorship.status === 'pending' ? 'secondary' : 'outline'
                  }>
                    {mentorship.status === 'active' ? 'Active' :
                     mentorship.status === 'pending' ? 'Pending' : 'Completed'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Started on {formatDate(mentorship.startDate)}</span>
                  </div>
                  {mentorship.endDate && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Completed on {formatDate(mentorship.endDate)}</span>
                    </div>
                  )}
                  {mentorship.notes && (
                    <p className="mt-2 text-sm">{mentorship.notes}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                {mentorship.status === 'active' && (
                  <Button className="w-full">
                    Schedule Session
                  </Button>
                )}
                {mentorship.status === 'pending' && user?.role !== 'student' && (
                  <Button className="w-full">
                    Approve Request
                  </Button>
                )}
                {mentorship.status === 'pending' && user?.role === 'student' && (
                  <Button variant="outline" className="w-full">
                    Awaiting Response
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <GraduationCap className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium">No mentorships found</h3>
            <p>Request a mentor to get started with the mentorship program</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MentorshipPage;
