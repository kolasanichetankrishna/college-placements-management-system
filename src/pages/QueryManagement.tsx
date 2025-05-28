
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Query as UserQuery } from '@/types';
import { getQueriesByTo, getQueriesByFrom, addQuery, updateQuery } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { HelpCircle, MessageSquare, Send, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';

const QueryManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [queries, setQueries] = useState<UserQuery[]>([]);
  const [sentQueries, setSentQueries] = useState<UserQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<UserQuery | null>(null);
  
  // Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [toRole, setToRole] = useState<string>('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    const fetchQueries = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        let receivedQueries: UserQuery[] = [];
        let userSentQueries: UserQuery[] = [];
        
        // Fetch queries sent to this user's role
        if (user.role !== 'student') {
          receivedQueries = await getQueriesByTo(user.role);
        }
        
        // Fetch queries sent by this user
        userSentQueries = await getQueriesByFrom(user.id);
        
        setQueries(receivedQueries);
        setSentQueries(userSentQueries);
      } catch (error) {
        console.error('Error fetching queries:', error);
        toast.error('Failed to load queries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQueries();
  }, [user]);

  const resetForm = () => {
    setSubject('');
    setMessage('');
    setToRole('');
    setResponse('');
    setSelectedQuery(null);
  };

  const handleOpenForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const handleOpenResponse = (query: UserQuery) => {
    setSelectedQuery(query);
    setResponse(query.response || '');
    setFormOpen(true);
  };

  const handleSubmitQuery = async () => {
    if (!user) return;
    if (!subject || !message || !toRole) {
      toast.error('All fields are required');
      return;
    }

    try {
      const newQuery: Omit<UserQuery, 'id'> = {
        from: user.id,
        to: toRole as UserQuery['to'],
        subject,
        message,
        date: new Date().toISOString(),
        status: 'open' // Explicitly typing as a literal 'open'
      };

      const queryId = await addQuery(newQuery);
      
      setSentQueries([...sentQueries, { id: queryId, ...newQuery }]);
      toast.success('Query submitted successfully');
      setFormOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting query:', error);
      toast.error('Failed to submit query');
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedQuery || !response) {
      toast.error('Response is required');
      return;
    }

    try {
      await updateQuery(selectedQuery.id, {
        response,
        status: 'closed'
      });
      
      // Update the queries state
      setQueries(queries.map(q => 
        q.id === selectedQuery.id 
          ? { ...q, response, status: 'closed' } 
          : q
      ));
      
      toast.success('Response submitted successfully');
      setFormOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Open</Badge>;
      case 'closed':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Closed</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> In Progress</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Query Management</h1>
          <p className="text-muted-foreground">
            {user?.role === 'student'
              ? 'Submit and track your queries'
              : 'Respond to student and faculty queries'}
          </p>
        </div>
        
        {user && (
          <Button onClick={handleOpenForm}>
            <Plus className="mr-2 h-4 w-4" />
            New Query
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-center">
            <p className="text-muted-foreground">Loading queries...</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="received" className="w-full">
          {user?.role !== 'student' && (
            <TabsList className="mb-4">
              <TabsTrigger value="received">Received Queries</TabsTrigger>
              <TabsTrigger value="sent">Sent Queries</TabsTrigger>
            </TabsList>
          )}
          
          <TabsContent value="received" className="space-y-4">
            {user?.role !== 'student' ? (
              queries.length > 0 ? (
                queries.map(query => (
                  <Card key={query.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle>{query.subject}</CardTitle>
                        {getStatusBadge(query.status)}
                      </div>
                      <CardDescription>
                        Received on {formatDate(query.date)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="mb-4">{query.message}</p>
                      {query.response && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm font-medium mb-1">Your Response:</p>
                          <p className="text-sm">{query.response}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      {query.status !== 'closed' ? (
                        <Button 
                          className="w-full"
                          onClick={() => handleOpenResponse(query)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {query.response ? 'Update Response' : 'Respond'}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleOpenResponse(query)}
                        >
                          View Response
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <HelpCircle className="h-12 w-12 mb-4" />
                    <h3 className="text-lg font-medium">No queries received</h3>
                    <p>You haven't received any queries yet</p>
                  </div>
                </Card>
              )
            ) : (
              <TabsContent value="sent" />
            )}
          </TabsContent>
          
          <TabsContent value="sent" className="space-y-4">
            {sentQueries.length > 0 ? (
              sentQueries.map(query => (
                <Card key={query.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{query.subject}</CardTitle>
                      {getStatusBadge(query.status)}
                    </div>
                    <CardDescription>
                      Sent to {query.to} on {formatDate(query.date)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="mb-4">{query.message}</p>
                    {query.response && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm font-medium mb-1">Response:</p>
                        <p className="text-sm">{query.response}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium">No queries sent</h3>
                  <p>You haven't sent any queries yet</p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedQuery ? (
            <>
              <DialogHeader>
                <DialogTitle>Respond to Query</DialogTitle>
                <DialogDescription>
                  Provide a response to the query: "{selectedQuery.subject}"
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium mb-1">Original Query:</p>
                  <p className="text-sm">{selectedQuery.message}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="response">Your Response</Label>
                  <Textarea 
                    id="response" 
                    rows={5}
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response here..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitResponse} disabled={!response.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Response
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Create New Query</DialogTitle>
                <DialogDescription>
                  Submit a new query to the appropriate department
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="toRole">Send To</Label>
                  <Select onValueChange={setToRole}>
                    <SelectTrigger id="toRole">
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {user?.role !== 'principal' && <SelectItem value="principal">Principal</SelectItem>}
                      {user?.role !== 'hod' && <SelectItem value="hod">HOD</SelectItem>}
                      {user?.role !== 'placement' && <SelectItem value="placement">Placement Officer</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your query"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your query in detail..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitQuery} disabled={!subject.trim() || !message.trim() || !toRole}>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Query
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QueryManagementPage;
