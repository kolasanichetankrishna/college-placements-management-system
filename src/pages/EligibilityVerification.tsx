
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CheckSquare, Search, Users, CheckCircle, XCircle } from 'lucide-react';

interface ExtendedUser extends User {
  eligibility?: {
    status: 'eligible' | 'ineligible' | 'pending';
    reason?: string;
    cgpa?: number;
    backlogs?: number;
  };
}

const EligibilityVerificationPage: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<ExtendedUser[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<ExtendedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<ExtendedUser | null>(null);
  const [cgpa, setCgpa] = useState<string>('');
  const [backlogs, setBacklogs] = useState<string>('0');
  const [status, setStatus] = useState<'eligible' | 'ineligible' | 'pending'>('pending');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user || (user.role !== 'placement' && user.role !== 'principal' && user.role !== 'hod')) return;
      
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
          ...doc.data()
        } as ExtendedUser));
        
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
    // Apply filters and search
    let filtered = [...students];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(query) || 
        student.email.toLowerCase().includes(query) ||
        (student.studentId && student.studentId.toLowerCase().includes(query))
      );
    }
    
    // Apply department filter
    if (departmentFilter) {
      filtered = filtered.filter(student => student.department === departmentFilter);
    }
    
    // Apply eligibility filter
    if (eligibilityFilter) {
      filtered = filtered.filter(student => student.eligibility?.status === eligibilityFilter);
    }
    
    setFilteredStudents(filtered);
  }, [searchQuery, departmentFilter, eligibilityFilter, students]);
  
  // Get unique departments for filter dropdown
  const departments = [...new Set(students.map(s => s.department).filter(Boolean))];

  const handleEditEligibility = (student: ExtendedUser) => {
    setSelectedStudent(student);
    setCgpa(student.eligibility?.cgpa?.toString() || '');
    setBacklogs(student.eligibility?.backlogs?.toString() || '0');
    setStatus(student.eligibility?.status || 'pending');
    setReason(student.eligibility?.reason || '');
  };

  const handleSaveEligibility = async () => {
    if (!selectedStudent) return;
    
    try {
      const eligibilityData = {
        eligibility: {
          status,
          reason: status === 'ineligible' ? reason : '',
          cgpa: parseFloat(cgpa) || 0,
          backlogs: parseInt(backlogs) || 0
        }
      };
      
      // Update in Firestore
      const studentRef = doc(db, 'users', selectedStudent.id);
      await updateDoc(studentRef, eligibilityData);
      
      // Update local state
      setStudents(students.map(s => 
        s.id === selectedStudent.id 
          ? { ...s, ...eligibilityData }
          : s
      ));
      
      toast.success('Eligibility status updated successfully');
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error updating eligibility:', error);
      toast.error('Failed to update eligibility status');
    }
  };

  // Check if user has permission to access this page
  if (user?.role !== 'placement' && user?.role !== 'principal' && user?.role !== 'hod') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access the eligibility verification page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Eligibility Verification</h1>
        <p className="text-muted-foreground">
          Verify and manage student eligibility for placement drives
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, email, or ID..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="w-40">
            <Select 
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept || ''}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-40">
            <Select 
              value={eligibilityFilter}
              onValueChange={setEligibilityFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Eligibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="eligible">Eligible</SelectItem>
                <SelectItem value="ineligible">Ineligible</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-center">
            <p className="text-muted-foreground">Loading student data...</p>
          </div>
        </div>
      ) : filteredStudents.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Student Eligibility
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
                  <TableHead>Department</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Backlogs</TableHead>
                  <TableHead>Eligibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.studentId || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.department || 'N/A'}</TableCell>
                    <TableCell>{student.eligibility?.cgpa || 'Not set'}</TableCell>
                    <TableCell>{student.eligibility?.backlogs || 0}</TableCell>
                    <TableCell>
                      {getEligibilityBadge(student.eligibility?.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditEligibility(student)}
                      >
                        Verify
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
            <p>Try adjusting your filters or search query</p>
          </div>
        </Card>
      )}
      
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Verify Eligibility: {selectedStudent.name}</h3>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cgpa">CGPA</Label>
                  <Input 
                    id="cgpa" 
                    type="number" 
                    min="0" 
                    max="10" 
                    step="0.01"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backlogs">Backlogs</Label>
                  <Input 
                    id="backlogs" 
                    type="number" 
                    min="0"
                    value={backlogs}
                    onChange={(e) => setBacklogs(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Eligibility Status</Label>
                <Select 
                  value={status}
                  onValueChange={(value) => setStatus(value as 'eligible' | 'ineligible' | 'pending')}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eligible">Eligible</SelectItem>
                    <SelectItem value="ineligible">Ineligible</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {status === 'ineligible' && (
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Input 
                    id="reason" 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for ineligibility"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEligibility}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getEligibilityBadge(status?: string) {
  switch (status) {
    case 'eligible':
      return <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Eligible</Badge>;
    case 'ineligible':
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Ineligible</Badge>;
    case 'pending':
    default:
      return <Badge variant="outline" className="flex items-center gap-1"><CheckSquare className="h-3 w-3" /> Pending</Badge>;
  }
}

export default EligibilityVerificationPage;
