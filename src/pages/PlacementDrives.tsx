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
import { Building, Calendar, MapPin, DollarSign, Clock, Plus, Search } from 'lucide-react';
import { PlacementDrive } from '@/types';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAllPlacementDrives, addPlacementDrive } from '@/lib/firestore';

const PlacementDrives: React.FC = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPlacementDrives = async () => {
      setIsLoading(true);
      try {
        const drivesData = await getAllPlacementDrives();
        if (drivesData.length > 0) {
          setDrives(drivesData);
        } else {
          const initialDrives = await initializeDefaultDrives();
          setDrives(initialDrives);
        }
      } catch (error) {
        console.error('Error fetching placement drives:', error);
        toast.error('Failed to load placement drives');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlacementDrives();
  }, []);
  
  const initializeDefaultDrives = async () => {
    const defaultDrives: Omit<PlacementDrive, 'id'>[] = [
      {
        company: 'Microsoft',
        position: 'Software Engineer',
        eligibility: 'CGPA > 7.5, No active backlogs',
        date: '2023-11-15',
        status: 'upcoming',
        description: 'Microsoft is looking for Software Engineers to join their team. This is a full-time role with competitive compensation.',
        location: 'Hyderabad',
        package: '₹18-25 LPA',
      },
      {
        company: 'Amazon',
        position: 'SDE-1',
        eligibility: 'CGPA > 8.0, No backlogs',
        date: '2023-11-20',
        status: 'upcoming',
        description: 'Amazon is hiring for SDE-1 positions across various teams. Strong problem-solving skills required.',
        location: 'Bangalore',
        package: '₹20-28 LPA',
      },
      {
        company: 'TCS',
        position: 'Digital Specialist Engineer',
        eligibility: 'CGPA > 6.5, Max 1 active backlog',
        date: '2023-11-10',
        status: 'ongoing',
        description: 'TCS is hiring for their Digital division. Looking for candidates with good programming knowledge.',
        location: 'Chennai, Hyderabad, Pune',
        package: '₹7-10 LPA',
      }
    ];
    
    const addedDrives: PlacementDrive[] = [];
    const drivesCollection = collection(db, 'placementDrives');
    
    for (const drive of defaultDrives) {
      try {
        const docRef = await addDoc(drivesCollection, drive);
        addedDrives.push({ id: docRef.id, ...drive });
      } catch (error) {
        console.error('Error adding initial drive:', error);
      }
    }
    
    return addedDrives;
  };
  
  const filteredDrives = drives.filter(drive => 
    drive.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drive.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drive.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const upcomingDrives = filteredDrives.filter(drive => drive.status === 'upcoming');
  const ongoingDrives = filteredDrives.filter(drive => drive.status === 'ongoing');
  const completedDrives = filteredDrives.filter(drive => drive.status === 'completed');

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleAddDrive = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const newDrive: Omit<PlacementDrive, 'id'> = {
      company: formData.get('company') as string,
      position: formData.get('position') as string,
      eligibility: formData.get('eligibility') as string,
      date: formData.get('date') as string,
      status: 'upcoming',
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      package: formData.get('package') as string,
    };
    
    try {
      const newDriveId = await addPlacementDrive(newDrive);
      
      setDrives([...drives, { id: newDriveId, ...newDrive }]);
      toast.success('New placement drive added successfully');
      
      event.currentTarget.reset();
    } catch (error) {
      console.error('Error adding placement drive:', error);
      toast.error('Failed to add placement drive');
    }
  };

  const handleApply = async (driveId: string) => {
    if (!user) {
      toast.error('You must be logged in to apply');
      return;
    }
    
    try {
      await addDoc(collection(db, 'applications'), {
        driveId,
        studentId: user.id,
        studentName: user.name,
        appliedAt: new Date().toISOString(),
        status: 'pending'
      });
      
      toast.success('Applied successfully! You will receive updates via email.');
    } catch (error) {
      console.error('Error applying for drive:', error);
      toast.error('Failed to apply for drive');
    }
  };

  const DriveCard = ({ drive }: { drive: PlacementDrive }) => (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              {drive.company}
            </CardTitle>
            <CardDescription className="text-base font-medium mt-1">
              {drive.position}
            </CardDescription>
          </div>
          <Badge variant={
            drive.status === 'upcoming' ? 'default' :
            drive.status === 'ongoing' ? 'secondary' : 'outline'
          }>
            {drive.status === 'upcoming' ? 'Upcoming' :
            drive.status === 'ongoing' ? 'Ongoing' : 'Completed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{formatDate(drive.date)}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{drive.location}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{drive.package}</span>
          </div>
          <div className="flex items-start mt-1">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
            <span className="text-muted-foreground">{drive.eligibility}</span>
          </div>
          <p className="mt-2 text-sm">{drive.description}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        {user?.role === 'student' && drive.status !== 'completed' && (
          <Button 
            className="w-full"
            onClick={() => handleApply(drive.id)}
          >
            Apply Now
          </Button>
        )}
        {user?.role === 'placement' && (
          <Button 
            variant="outline" 
            className="w-full"
          >
            Edit Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Placement Drives</h1>
          <p className="text-muted-foreground">
            {user?.role === 'student'
              ? 'Browse and apply for upcoming placement opportunities'
              : 'Manage campus recruitment drives'}
          </p>
        </div>
        
        {user?.role === 'placement' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Drive
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <form onSubmit={handleAddDrive}>
                <DialogHeader>
                  <DialogTitle>Add New Placement Drive</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new campus recruitment drive
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" name="company" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input id="position" name="position" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eligibility">Eligibility Criteria</Label>
                    <Input id="eligibility" name="eligibility" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Drive Date</Label>
                      <Input id="date" name="date" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="package">Package</Label>
                      <Input id="package" name="package" placeholder="e.g. ₹10-15 LPA" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" rows={3} required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Drive</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by company, position, or location..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-center">
            <p className="text-muted-foreground">Loading placement drives...</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingDrives.length})</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing ({ongoingDrives.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedDrives.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingDrives.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingDrives.map(drive => (
                  <DriveCard key={drive.id} drive={drive} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Building className="h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium">No upcoming drives found</h3>
                  <p>Check back later for new opportunities</p>
                </div>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="ongoing" className="space-y-4">
            {ongoingDrives.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ongoingDrives.map(drive => (
                  <DriveCard key={drive.id} drive={drive} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Building className="h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium">No ongoing drives</h3>
                  <p>There are no active recruitment processes right now</p>
                </div>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            {completedDrives.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedDrives.map(drive => (
                  <DriveCard key={drive.id} drive={drive} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Building className="h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium">No completed drives</h3>
                  <p>Past drives will appear here</p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PlacementDrives;
