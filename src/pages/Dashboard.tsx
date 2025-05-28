
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Briefcase, Users, Brain, CheckSquare, GraduationCap, Building, 
  UserCheck, HelpCircle
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { PlacementData, SkillData } from '@/types';
import { fetchStudentSkillData } from '@/lib/dashboardService';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';

const studentDashboard = () => {
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [placementDrives, setPlacementDrives] = useState(0);
  const [applications, setApplications] = useState(0);
  const [mentorshipSessions, setMentorshipSessions] = useState(0);
  const [skillProgress, setSkillProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        // Fetch skill data for student
        if (user?.id) {
          const skills = await fetchStudentSkillData(user.id);
          if (skills && skills.length > 0) {
            setSkillData(skills);
            
            // Calculate skill progress
            if (skills.length > 0) {
              const totalCurrent = skills.reduce((acc, skill) => acc + skill.current, 0);
              const totalTarget = skills.reduce((acc, skill) => acc + skill.target, 0);
              setSkillProgress(Math.round((totalCurrent / totalTarget) * 100));
            }
          }
          
          // Fetch placement drives count
          const drivesRef = collection(db, 'placementDrives');
          const drivesQuery = query(drivesRef, where('status', 'in', ['upcoming', 'ongoing']));
          const drivesSnapshot = await getDocs(drivesQuery);
          setPlacementDrives(drivesSnapshot.size);
          
          // Fetch applications count
          const applicationsRef = collection(db, 'applications');
          const applicationsQuery = query(applicationsRef, where('studentId', '==', user.id));
          const applicationsSnapshot = await getDocs(applicationsQuery);
          setApplications(applicationsSnapshot.size);
          
          // Fetch mentorship sessions count
          const mentorshipsRef = collection(db, 'mentorships');
          const mentorshipsQuery = query(mentorshipsRef, where('studentId', '==', user.id), where('status', '==', 'active'));
          const mentorshipsSnapshot = await getDocs(mentorshipsQuery);
          setMentorshipSessions(mentorshipsSnapshot.size);
        }
      } catch (error) {
        console.error('Error fetching student dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudentData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Placement Drives"
          value={`${placementDrives}`}
          description={placementDrives > 0 ? `${Math.min(placementDrives, 5)} upcoming this week` : "No upcoming drives"}
          icon={<Briefcase className="h-5 w-5" />}
          trend="neutral"
          trendValue="Updated today"
        />
        <DashboardCard
          title="Applications"
          value={`${applications}`}
          description={applications > 0 ? "Track in placement drives" : "No applications yet"}
          icon={<Building className="h-5 w-5" />}
          trend="neutral"
          trendValue="Current status"
        />
        <DashboardCard
          title="Mentorship Sessions"
          value={`${mentorshipSessions}`}
          description={mentorshipSessions > 0 ? "Active mentorships" : "No active mentorships"}
          icon={<GraduationCap className="h-5 w-5" />}
          trend="neutral"
          trendValue="Current status"
        />
        <DashboardCard
          title="Skill Progress"
          value={`${skillProgress}%`}
          description={skillProgress > 0 ? "Of target skills" : "Start skill assessment"}
          icon={<Brain className="h-5 w-5" />}
          trend={skillProgress > 50 ? "up" : "neutral"}
          trendValue={skillProgress > 0 ? `${skillProgress}% of target` : "Not started"}
        />
      </div>

      <Tabs defaultValue="skills" className="space-y-4">
        <TabsList>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Gap Analysis</CardTitle>
              <CardDescription>
                Current skills vs target skills for industry requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                {skillData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={skillData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="target" fill="#8884d8" name="Target Level" />
                      <Bar dataKey="current" fill="#82ca9d" name="Current Level" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Loading skill data...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const hodDashboard = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [placedStudents, setPlacedStudents] = useState(0);
  const [avgPackage, setAvgPackage] = useState(0);
  const [eligibleStudents, setEligibleStudents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchDepartmentData = async () => {
      setIsLoading(true);
      try {
        if (user?.department) {
          // Fetch students count
          const studentsRef = collection(db, 'users');
          const studentsQuery = query(studentsRef, where('department', '==', user.department), where('role', '==', 'student'));
          const studentsSnapshot = await getDocs(studentsQuery);
          const totalStudentsCount = studentsSnapshot.size;
          
          // Fetch placed students count
          const placedQuery = query(
            studentsRef, 
            where('department', '==', user.department), 
            where('role', '==', 'student'),
            where('isPlaced', '==', true)
          );
          const placedSnapshot = await getDocs(placedQuery);
          const placedStudentsCount = placedSnapshot.size;
          
          setTotalStudents(totalStudentsCount);
          setPlacedStudents(placedStudentsCount);
          setEligibleStudents(Math.round(totalStudentsCount * 0.9)); // Assumption: 90% eligibility
          
          // Fetch average package data from packages collection
          const packagesRef = collection(db, 'packages');
          const packagesQuery = query(packagesRef, where('department', '==', user.department));
          const packagesSnapshot = await getDocs(packagesQuery);
          
          if (!packagesSnapshot.empty) {
            let sum = 0;
            packagesSnapshot.forEach(doc => {
              sum += doc.data().amount || 0;
            });
            setAvgPackage(sum / packagesSnapshot.size);
          } else {
            // Default average package if no data
            setAvgPackage(6.8);
          }
        }
      } catch (error) {
        console.error('Error fetching department data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDepartmentData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Students"
          value={totalStudents.toString()}
          description={`Department of ${user?.department || 'Unknown'}`}
          icon={<Users className="h-5 w-5" />}
          trend="neutral"
          trendValue="Current count"
        />
        <DashboardCard
          title="Placed Students"
          value={placedStudents.toString()}
          description={totalStudents > 0 ? `${Math.round((placedStudents / totalStudents) * 100)}% placement rate` : "No data"}
          icon={<UserCheck className="h-5 w-5" />}
          trend={placedStudents > 0 ? "up" : "neutral"}
          trendValue="Current status"
        />
        <DashboardCard
          title="Avg. Package"
          value={`₹${avgPackage.toFixed(1)}L`}
          description="Per annum"
          icon={<Briefcase className="h-5 w-5" />}
          trend="neutral"
          trendValue="Current average"
        />
        <DashboardCard
          title="Eligible Students"
          value={eligibleStudents.toString()}
          description={totalStudents > 0 ? `${Math.round((eligibleStudents / totalStudents) * 100)}% eligibility rate` : "No data"}
          icon={<CheckSquare className="h-5 w-5" />}
          trend="neutral"
          trendValue="Current count"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
          <CardDescription>
            Summary of department performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Key Performance Indicators</h3>
              <p className="text-sm text-muted-foreground">
                {placedStudents > 0 && totalStudents > 0 ? 
                  `${placedStudents} out of ${totalStudents} students placed (${Math.round((placedStudents / totalStudents) * 100)}% placement rate)` : 
                  "No placement data available yet."}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {`Average package: ₹${avgPackage.toFixed(1)}L per annum`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const placementDashboard = () => {
  const [activeDrives, setActiveDrives] = useState(0);
  const [companies, setCompanies] = useState(0);
  const [queries, setQueries] = useState(0);
  const [eligibleStudents, setEligibleStudents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPlacementData = async () => {
      setIsLoading(true);
      try {
        // Fetch active drives
        const drivesRef = collection(db, 'placementDrives');
        const drivesQuery = query(drivesRef, where('status', 'in', ['upcoming', 'ongoing']));
        const drivesSnapshot = await getDocs(drivesQuery);
        setActiveDrives(drivesSnapshot.size);
        
        // Fetch companies
        const companiesRef = collection(db, 'companies');
        const companiesQuery = query(companiesRef);
        const companiesSnapshot = await getDocs(companiesQuery);
        setCompanies(companiesSnapshot.size);
        
        // Fetch queries
        const queriesRef = collection(db, 'queries');
        const queriesQuery = query(queriesRef, where('status', '==', 'open'));
        const queriesSnapshot = await getDocs(queriesQuery);
        setQueries(queriesSnapshot.size);
        
        // Fetch eligible students
        const studentsRef = collection(db, 'users');
        const studentsQuery = query(studentsRef, where('role', '==', 'student'), where('isEligible', '==', true));
        const studentsSnapshot = await getDocs(studentsQuery);
        setEligibleStudents(studentsSnapshot.size);
      } catch (error) {
        console.error('Error fetching placement data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlacementData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Active Drives"
          value={activeDrives.toString()}
          description={activeDrives > 0 ? `${Math.min(activeDrives, 3)} starting this week` : "No upcoming drives"}
          icon={<Briefcase className="h-5 w-5" />}
          trend="neutral"
          trendValue="Current status"
        />
        <DashboardCard
          title="Companies Visiting"
          value={companies.toString()}
          description={companies > 0 ? `${Math.min(companies, 4)} new this month` : "No companies registered"}
          icon={<Building className="h-5 w-5" />}
          trend="neutral"
          trendValue="Current status"
        />
        <DashboardCard
          title="Student Queries"
          value={queries.toString()}
          description={queries > 0 ? `${Math.min(queries, 8)} pending responses` : "No pending queries"}
          icon={<HelpCircle className="h-5 w-5" />}
          trend="neutral"
          trendValue="Current status"
        />
        <DashboardCard
          title="Eligible Students"
          value={eligibleStudents.toString()}
          description={eligibleStudents > 0 ? "Ready for placements" : "No eligible students"}
          icon={<UserCheck className="h-5 w-5" />}
          trend="neutral"
          trendValue="Current count"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Placement Overview</CardTitle>
          <CardDescription>
            Current placement cell activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Active Placement Drives</h3>
              <p className="text-sm text-muted-foreground">
                {activeDrives > 0 ? 
                  `${activeDrives} active placement drives ongoing. ${companies} registered companies participating.` : 
                  "No active placement drives at the moment."}
              </p>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Student Engagement</h3>
              <p className="text-sm text-muted-foreground">
                {queries > 0 ? 
                  `${queries} open student queries need attention. ${eligibleStudents} students are eligible for upcoming drives.` : 
                  "No pending student queries."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const principalDashboard = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [placementRate, setPlacementRate] = useState(0);
  const [avgPackage, setAvgPackage] = useState(0);
  const [companiesVisited, setCompaniesVisited] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchInstitutionData = async () => {
      setIsLoading(true);
      try {
        // Fetch total students
        const studentsRef = collection(db, 'users');
        const studentsQuery = query(studentsRef, where('role', '==', 'student'));
        const studentsSnapshot = await getDocs(studentsQuery);
        const totalStudentsCount = studentsSnapshot.size;
        
        // Fetch placed students
        const placedQuery = query(studentsRef, where('role', '==', 'student'), where('isPlaced', '==', true));
        const placedSnapshot = await getDocs(placedQuery);
        const placedStudentsCount = placedSnapshot.size;
        
        setTotalStudents(totalStudentsCount);
        setPlacementRate(totalStudentsCount > 0 ? Math.round((placedStudentsCount / totalStudentsCount) * 100) : 0);
        
        // Fetch average package
        const packagesRef = collection(db, 'packages');
        const packagesQuery = query(packagesRef);
        const packagesSnapshot = await getDocs(packagesQuery);
        
        if (!packagesSnapshot.empty) {
          let sum = 0;
          packagesSnapshot.forEach(doc => {
            sum += doc.data().amount || 0;
          });
          setAvgPackage(sum / packagesSnapshot.size);
        } else {
          setAvgPackage(7.2);
        }
        
        // Fetch companies visited
        const companiesRef = collection(db, 'companies');
        const companiesQuery = query(companiesRef);
        const companiesSnapshot = await getDocs(companiesQuery);
        setCompaniesVisited(companiesSnapshot.size);
      } catch (error) {
        console.error('Error fetching institution data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInstitutionData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Students"
          value={totalStudents.toString()}
          description="Institution-wide"
          icon={<Users className="h-5 w-5" />}
          trend="neutral"
          trendValue="Current count"
        />
        <DashboardCard
          title="Placement Rate"
          value={`${placementRate}%`}
          description={placementRate > 0 ? `Up from ${placementRate - 5}% last year` : "No data"}
          icon={<UserCheck className="h-5 w-5" />}
          trend="up"
          trendValue="5%"
        />
        <DashboardCard
          title="Avg. Package"
          value={`₹${avgPackage.toFixed(1)}L`}
          description="Per annum"
          icon={<Briefcase className="h-5 w-5" />}
          trend="up"
          trendValue="10%"
        />
        <DashboardCard
          title="Companies Visited"
          value={companiesVisited.toString()}
          description="This academic year"
          icon={<Building className="h-5 w-5" />}
          trend="up"
          trendValue="20%"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Institution Overview</CardTitle>
          <CardDescription>
            Summary of institutional performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Placement Highlights</h3>
              <p className="text-sm text-muted-foreground">
                {`Current placement rate is at ${placementRate}%, with an average package of ₹${avgPackage.toFixed(1)}L per annum.`}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {`${companiesVisited} companies have visited campus this academic year.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}. Here's an overview of your information.
        </p>
      </div>

      {user.role === 'student' && studentDashboard()}
      {user.role === 'hod' && hodDashboard()}
      {user.role === 'placement' && placementDashboard()}
      {user.role === 'principal' && principalDashboard()}
    </div>
  );
};

export default Dashboard;
