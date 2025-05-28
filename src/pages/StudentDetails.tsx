
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Search, User as UserIcon, Users, Briefcase, GraduationCap } from 'lucide-react';

interface StudentDetail extends User {
  eligibility?: {
    status: 'eligible' | 'ineligible' | 'pending';
    cgpa?: number;
    backlogs?: number;
  };
  placementHistory?: {
    id: string;
    company: string;
    position: string;
    status: 'placed' | 'rejected' | 'pending';
    date: string;
    package?: string;
  }[];
}

const StudentDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentDetail[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user || (user.role !== 'principal' && user.role !== 'hod' && user.role !== 'placement')) return;
      
      setIsLoading(true);
      try {
        const studentsRef = collection(db, 'users');
        let studentQuery = query(studentsRef, where('role', '==', 'student'));
        
        // For HODs, filter by department automatically
        if (user.role === 'hod' && user.department) {
          studentQuery = query(studentQuery, where('department', '==', user.department));
        }
        
        const snapshot = await getDocs(studentQuery);
        const studentsData = snapshot.docs.map(doc => ({ 
          id: doc.id,
          ...doc.data(),
          placementHistory: [] // Initialize empty placement history
        } as StudentDetail));
        
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load student data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  useEffect(() => {
    // Filter students based on search query
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(query) || 
        student.email.toLowerCase().includes(query) ||
        (student.studentId && student.studentId.toLowerCase().includes(query))
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const handleViewDetails = async (student: StudentDetail) => {
    setLoadingDetails(true);
    setSelectedStudent(student);
    
    try {
      // Fetch placement history
      const placementsRef = collection(db, 'placements');
      const placementQuery = query(placementsRef, where('studentId', '==', student.id));
      const placementSnapshot = await getDocs(placementQuery);
      
      if (!placementSnapshot.empty) {
        const placementHistory = placementSnapshot.docs.map(doc => ({
          id: doc.id,
          company: doc.data().company || 'Unknown',
          position: doc.data().position || 'Unknown',
          status: doc.data().status || 'pending',
          date: doc.data().date || new Date().toISOString(),
          package: doc.data().package
        }));
        
        setSelectedStudent(prev => {
          if (!prev) return null;
          return {
            ...prev,
            placementHistory
          };
        });
      }
      
      // Fetch eligibility if not already included
      if (!student.eligibility) {
        const userDoc = await getDoc(doc(db, 'users', student.id));
        const userData = userDoc.data() as DocumentData;
        
        if (userData && userData.eligibility) {
          setSelectedStudent(prev => {
            if (!prev) return null;
            return {
              ...prev,
              eligibility: userData.eligibility
            };
          });
        }
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Failed to load detailed student information');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Check if user has permission to access this page
  if (user?.role !== 'principal' && user?.role !== 'hod' && user?.role !== 'placement') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access the student details page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Details</h1>
        <p className="text-muted-foreground">
          View comprehensive student information and placement history
        </p>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, email, or ID..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-center">
            <p className="text-muted-foreground">Loading students...</p>
          </div>
        </div>
      ) : filteredStudents.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Student Records
            </CardTitle>
            <CardDescription>
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.studentId || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.department || 'N/A'}</TableCell>
                    <TableCell>{student.year ? `${student.year}${getYearSuffix(student.year)} Year` : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(student)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Users className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium">No students found</h3>
            <p>Try adjusting your search query</p>
          </div>
        </Card>
      )}
      
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold">Student Details</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </Button>
            </div>
            
            {loadingDetails ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-center">
                  <p className="text-muted-foreground">Loading student details...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <UserIcon className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                        <dd>{selectedStudent.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                        <dd>{selectedStudent.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Student ID</dt>
                        <dd>{selectedStudent.studentId || 'Not assigned'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Department</dt>
                        <dd>{selectedStudent.department || 'Not assigned'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Year</dt>
                        <dd>{selectedStudent.year ? `${selectedStudent.year}${getYearSuffix(selectedStudent.year)} Year` : 'Not assigned'}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <GraduationCap className="h-5 w-5" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.eligibility ? (
                      <dl className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">CGPA</dt>
                          <dd>{selectedStudent.eligibility.cgpa || 'Not recorded'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Backlogs</dt>
                          <dd>{selectedStudent.eligibility.backlogs || 0}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Eligibility Status</dt>
                          <dd>
                            {getEligibilityBadge(selectedStudent.eligibility.status)}
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="text-muted-foreground">No academic information available</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Briefcase className="h-5 w-5" />
                      Placement History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.placementHistory && selectedStudent.placementHistory.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Company</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Package</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedStudent.placementHistory.map((placement) => (
                            <TableRow key={placement.id}>
                              <TableCell className="font-medium">{placement.company}</TableCell>
                              <TableCell>{placement.position}</TableCell>
                              <TableCell>
                                {getPlacementStatusBadge(placement.status)}
                              </TableCell>
                              <TableCell>{formatDate(placement.date)}</TableCell>
                              <TableCell>{placement.package || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground">No placement history available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get the correct suffix for the year
function getYearSuffix(year: number): string {
  if (year === 1) return 'st';
  if (year === 2) return 'nd';
  if (year === 3) return 'rd';
  return 'th';
}

function getEligibilityBadge(status?: string) {
  switch (status) {
    case 'eligible':
      return <Badge className="bg-green-500 hover:bg-green-600">Eligible</Badge>;
    case 'ineligible':
      return <Badge variant="destructive">Ineligible</Badge>;
    case 'pending':
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}

function getPlacementStatusBadge(status: string) {
  switch (status) {
    case 'placed':
      return <Badge className="bg-green-500 hover:bg-green-600">Placed</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    case 'pending':
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}

function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

export default StudentDetailsPage;
