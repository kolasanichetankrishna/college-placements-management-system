
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getAllUsers } from '@/lib/firestore';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, FileText, Clock, X } from 'lucide-react';
import { toast } from 'sonner';

// Resume data interface (matching the one from ResumeUpload)
interface ResumeData {
  fileName: string;
  fileSize: number;
  uploadDate: string;
  skills: string[];
  education: string;
  experience: string;
  base64Content?: string;
}

const StudentResumes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');

  useEffect(() => {
    // Redirect if not HOD or placement officer
    if (user && user.role !== 'hod' && user.role !== 'placement') {
      toast.error('You do not have permission to access this page');
      navigate('/dashboard');
      return;
    }

    const fetchStudents = async () => {
      try {
        // Fetch all users and filter for students
        const allUsers = await getAllUsers();
        const studentUsers = allUsers.filter(u => u.role === 'student');
        setStudents(studentUsers);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user, navigate]);

  const getFilteredStudents = () => {
    if (!searchTerm.trim()) return students;
    
    const term = searchTerm.toLowerCase();
    return students.filter(
      student => 
        student.name.toLowerCase().includes(term) ||
        student.studentId?.toLowerCase().includes(term) ||
        student.department?.toLowerCase().includes(term) ||
        (student.skills && student.skills.some(skill => skill.toLowerCase().includes(term)))
    );
  };

  const viewStudentResume = (student: User) => {
    setSelectedStudent(student);
    setViewMode('details');
    
    // Try to load resume from localStorage
    if (student.id) {
      const storedResume = localStorage.getItem(`resume_${student.id}`);
      if (storedResume) {
        try {
          const resumeData = JSON.parse(storedResume) as ResumeData;
          setSelectedResume(resumeData);
        } catch (error) {
          console.error('Error parsing stored resume:', error);
          setSelectedResume(null);
          toast.error('Could not load resume data');
        }
      } else {
        setSelectedResume(null);
      }
    }
  };

  const downloadResume = () => {
    if (!selectedResume?.base64Content) {
      toast.error('No resume content available for download');
      return;
    }

    try {
      // Create a download link for the base64 content
      const link = document.createElement('a');
      link.href = selectedResume.base64Content;
      link.download = selectedResume.fileName || 'student_resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Resume download started');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    }
  };

  const goBack = () => {
    setViewMode('list');
    setSelectedStudent(null);
    setSelectedResume(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to be logged in to view student resumes</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/login')} className="w-full">Go to Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {viewMode === 'list' ? (
        <Card className="shadow-lg border-opacity-50">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-2xl font-bold">Student Resumes</CardTitle>
            <CardDescription>
              View and download student resumes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, ID, department or skills..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Resume Status</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredStudents().length > 0 ? (
                    getFilteredStudents().map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.department || 'N/A'}</TableCell>
                        <TableCell>{student.year || 'N/A'}</TableCell>
                        <TableCell>
                          {student.hasResume ? (
                            <span className="flex items-center text-green-600">
                              <FileText className="h-4 w-4 mr-1" />
                              Available
                            </span>
                          ) : (
                            <span className="text-gray-500">Not uploaded</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {student.skills?.slice(0, 2).map((skill, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {skill}
                              </span>
                            ))}
                            {student.skills && student.skills.length > 2 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted">
                                +{student.skills.length - 2}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewStudentResume(student)}
                            disabled={!student.hasResume}
                          >
                            View Resume
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        No students found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 flex justify-between">
            <p className="text-sm text-muted-foreground">
              Total Students: {students.length} | With Resumes: {students.filter(s => s.hasResume).length}
            </p>
          </CardFooter>
        </Card>
      ) : (
        <Card className="shadow-lg border-opacity-50">
          <CardHeader className="bg-primary/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                {selectedStudent?.name}'s Resume
              </CardTitle>
              <CardDescription>
                {selectedStudent?.department} | Year: {selectedStudent?.year} | ID: {selectedStudent?.studentId}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={goBack}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {selectedResume ? (
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Resume Information</h3>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        Last updated: {new Date(selectedResume.uploadDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Button onClick={downloadResume}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedResume.skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Education</Label>
                    <div className="p-3 bg-muted/40 rounded-md mt-2 whitespace-pre-line">
                      {selectedResume.education || "No education information provided"}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Experience</Label>
                    <div className="p-3 bg-muted/40 rounded-md mt-2 whitespace-pre-line">
                      {selectedResume.experience || "No experience information provided"}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preview">
                  {selectedResume.base64Content ? (
                    <div className="bg-muted/20 p-4 rounded-md">
                      <div className="w-full bg-white rounded-md shadow-sm overflow-hidden" style={{ height: '70vh' }}>
                        {selectedResume.fileName.endsWith('.pdf') ? (
                          <iframe
                            src={selectedResume.base64Content}
                            width="100%"
                            height="100%"
                            title="Resume Preview"
                            className="border-0"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full">
                            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                              {selectedResume.fileName} ({(selectedResume.fileSize / 1024).toFixed(2)} KB)
                            </p>
                            <Button variant="outline" className="mt-4" onClick={downloadResume}>
                              <Download className="h-4 w-4 mr-2" />
                              Download to View
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No preview available</h3>
                      <p className="text-muted-foreground mt-2">
                        This resume cannot be previewed but can be downloaded.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Resume Not Available</h3>
                <p className="text-muted-foreground mt-2">
                  This student has marked that they have a resume, but the data could not be found.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/30">
            <Button variant="outline" onClick={goBack}>
              Back to Student List
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default StudentResumes;
