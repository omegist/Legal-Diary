import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, UserPlus, Edit } from 'lucide-react';
import { Card, CardContent } from '@/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/layout/Header';
import { getRequestsBySender, getUserById, getDiaryById } from '@/lib/storage';
import { Badge } from '@/ui/badge';
import { Request } from '@/types';

export default function MyRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [lawyers, setLawyers] = useState<Map<string, any>>(new Map());
  const [diaries, setDiaries] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      if (!user) return;
      try {
        const data = await getRequestsBySender(user.id);
        setRequests(data);
        
        // Load lawyers and diaries
        const lawyerMap = new Map();
        const diaryMap = new Map();
        for (const req of data) {
          if (!lawyerMap.has(req.receiverId)) {
            const lawyer = await getUserById(req.receiverId);
            if (lawyer) lawyerMap.set(req.receiverId, lawyer);
          }
          if (req.diaryId && !diaryMap.has(req.diaryId)) {
            const diary = await getDiaryById(req.diaryId);
            if (diary) diaryMap.set(req.diaryId, diary);
          }
        }
        setLawyers(lawyerMap);
        setDiaries(diaryMap);
      } catch (error) {
        console.error('Error loading requests:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [user]);

  if (!user || user.role !== 'partner') {
    navigate('/dashboard');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading requests...</p>
          </div>
        </main>
      </div>
    );
  }
  const partnerRequests = requests.filter(r => r.type === 'partner_request');
  const editRequests = requests.filter(r => r.type === 'edit_request');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="gap-1 bg-green-500/20 text-green-400 hover:bg-green-500/30">
            <CheckCircle className="h-3 w-3" />
            Accepted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold mb-2">My Requests</h1>
          <p className="text-muted-foreground">
            Track your partnership and edit requests
          </p>
        </div>

        <Tabs defaultValue="partners" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="partners" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Partner Requests
            </TabsTrigger>
            <TabsTrigger value="edits" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="partners">
            {partnerRequests.length > 0 ? (
              <div className="space-y-4">
                {partnerRequests.map((request) => {
                  const lawyer = lawyers.get(request.receiverId);
                  if (!lawyer) return null;

                  return (
                    <Card key={request.id} className="glass-effect border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{lawyer.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Requested {new Date(request.createdAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="glass-effect border-primary/20">
                <CardContent className="py-12 text-center">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-serif text-xl font-semibold mb-2">No Partner Requests</h3>
                  <p className="text-muted-foreground">
                    Search for lawyers and send partnership requests.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="edits">
            {editRequests.length > 0 ? (
              <div className="space-y-4">
                {editRequests.map((request) => {
                  const lawyer = lawyers.get(request.receiverId);
                  const diary = request.diaryId ? diaries.get(request.diaryId) : null;
                  if (!lawyer || !diary) return null;

                  return (
                    <Card key={request.id} className="glass-effect border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{diary.caseNumber}</h3>
                            <p className="text-sm text-muted-foreground">
                              Lawyer: {lawyer.name}
                            </p>
                            {request.reason && (
                              <p className="text-sm mt-2 text-muted-foreground">
                                Reason: {request.reason}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Requested {new Date(request.createdAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="glass-effect border-primary/20">
                <CardContent className="py-12 text-center">
                  <Edit className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-serif text-xl font-semibold mb-2">No Edit Requests</h3>
                  <p className="text-muted-foreground">
                    Request edit permissions from diary view.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
