
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, Search, Filter } from 'lucide-react';

const StudentDirectoryPage: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

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
        } as User));
        
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
    
    // Apply year filter
    if (yearFilter) {
      filtered = filtered.filter(student => student.year === parseInt(yearFilter));
    }
    
    setFilteredStudents(filtered);
  }, [searchQuery, departmentFilter, yearFilter, students]);
  
  // Get unique departments for filter dropdown
  const departments = [...new Set(students.map(s => s.department).filter(Boolean))];
  
  // Check if user has permission to access this page
  if (user?.role !== 'placement' && user?.role !== 'principal' && user?.role !== 'hod') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access the student directory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Directory</h1>
        <p className="text-muted-foreground">
          View and filter student information
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
          
          <div className="w-32">
            <Select 
              value={yearFilter}
              onValueChange={setYearFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Years</SelectItem>
                <SelectItem value="1">1st Year</SelectItem>
                <SelectItem value="2">2nd Year</SelectItem>
                <SelectItem value="3">3rd Year</SelectItem>
                <SelectItem value="4">4th Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-center">
            <p className="text-muted-foreground">Loading student directory...</p>
          </div>
        </div>
      ) : filteredStudents.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Directory
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.studentId || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      {student.department ? (
                        <Badge variant="outline">{student.department}</Badge>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {student.year ? `${student.year}${getYearSuffix(student.year)} Year` : 'N/A'}
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

export default StudentDirectoryPage;
