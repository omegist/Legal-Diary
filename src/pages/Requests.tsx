import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, UserPlus, Edit, Bell, History } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/layout/Header';
import { 
  getRequestsByReceiver, 
  updateRequest, 
  getUserById, 
  getDiaryById,
  createPartnerRelationship,
  grantEditPermission,
  getEditPermissions
} from '@/lib/storage';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Request, PartnerRelationship, DiaryEditPermission } from '@/types';

export default function Requests() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [senders, setSenders] = useState<Map<string, any>>(new Map());
  const [diaries, setDiaries] = useState<Map<string, any>>(new Map());
  const [permissions, setPermissions] = useState<DiaryEditPermission[]>([]);

  useEffect(() => {
    const loadRequests = async () => {
      if (!user) return;
      try {
        const data = await getRequestsByReceiver(user.id);
        setRequests(data);
        
        // Load permissions history
        const allPermissions = await getEditPermissions();
        const myPermissions = allPermissions.filter(p => p.grantedBy === user.id);
        setPermissions(myPermissions);
        
        // Load senders and diaries
        const senderMap = new Map();
        const diaryMap = new Map();
        for (const req of data) {
          if (!senderMap.has(req.senderId)) {
            const sender = await getUserById(req.senderId);
            if (sender) senderMap.set(req.senderId, sender);
          }
          if (req.diaryId && !diaryMap.has(req.diaryId)) {
            const diary = await getDiaryById(req.diaryId);
            if (diary) diaryMap.set(req.diaryId, diary);
          }
        }
        // Load diaries and partners for permissions
        for (const perm of myPermissions) {
          if (!diaryMap.has(perm.diaryId)) {
            const diary = await getDiaryById(perm.diaryId);
            if (diary) diaryMap.set(perm.diaryId, diary);
          }
          if (!senderMap.has(perm.partnerId)) {
            const partner = await getUserById(perm.partnerId);
            if (partner) senderMap.set(perm.partnerId, partner);
          }
        }
        setSenders(senderMap);
        setDiaries(diaryMap);
      } catch (error) {
        console.error('Error loading requests:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [user, refreshKey]);

  if (!user || user.role !== 'lawyer') {
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

  const handleApprovePartner = async (request: Request) => {
    // Create partner relationship
    const relationship: PartnerRelationship = {
      id: crypto.randomUUID(),
      lawyerId: user.id,
      partnerId: request.senderId,
      status: 'accepted',
      createdAt: new Date().toISOString(),
    };
    await createPartnerRelationship(relationship);
    
    // Update request status
    await updateRequest(request.id, 'accepted');
    
    const sender = await getUserById(request.senderId);
    toast({
      title: 'Partner Added',
      description: `${sender?.name} is now your partner.`,
    });
    
    setRefreshKey(prev => prev + 1);
  };

  const handleRejectPartner = async (request: Request) => {
    await updateRequest(request.id, 'rejected');
    toast({
      title: 'Request Rejected',
      description: 'The partnership request has been declined.',
    });
    setRefreshKey(prev => prev + 1);
  };

  const handleApproveEdit = async (request: Request) => {
    if (!request.diaryId) return;
    
    const permission: DiaryEditPermission = {
      id: crypto.randomUUID(),
      diaryId: request.diaryId,
      partnerId: request.senderId,
      canEdit: true,
      grantedAt: new Date().toISOString(),  // This is when permission was granted
      grantedBy: user.id,
    };
    await grantEditPermission(permission);
    
    await updateRequest(request.id, 'accepted');
    
    const sender = await getUserById(request.senderId);
    const diary = await getDiaryById(request.diaryId);
    toast({
      title: 'Edit Permission Granted',
      description: `${sender?.name} can now edit ${diary?.caseNumber}.`,
    });
    
    setRefreshKey(prev => prev + 1);
  };

  const handleRejectEdit = async (request: Request) => {
    await updateRequest(request.id, 'rejected');
    toast({
      title: 'Request Rejected',
      description: 'The edit request has been declined.',
    });
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold mb-2">Requests Dashboard</h1>
          <p className="text-muted-foreground">
            Manage partnership and edit requests
          </p>
        </div>

        <Tabs defaultValue="partners" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
            <TabsTrigger value="partners" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Partner Requests
              {partnerRequests.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {partnerRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="edits" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Requests
              {editRequests.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {editRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Permission History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="partners">
            {partnerRequests.length > 0 ? (
              <div className="space-y-4">
                {partnerRequests.map((request) => {
                  const sender = senders.get(request.senderId);
                  if (!sender) return null;

                  return (
                    <Card key={request.id} className="glass-effect border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 border-2 border-primary/20">
                            <AvatarImage src={sender.profilePhoto} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {sender.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{sender.name}</h3>
                            <p className="text-sm text-muted-foreground">{sender.phone}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Requested {new Date(request.createdAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectPartner(request)}
                              className="border-destructive text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprovePartner(request)}
                              className="gold-gradient text-primary-foreground"
                            >
                              <Check className="mr-1 h-4 w-4" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="glass-effect border-primary/20">
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-serif text-xl font-semibold mb-2">No Partner Requests</h3>
                  <p className="text-muted-foreground">
                    When partners request to connect, they'll appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="edits">
            {editRequests.length > 0 ? (
              <div className="space-y-4">
                {editRequests.map((request) => {
                  const sender = senders.get(request.senderId);
                  const diary = request.diaryId ? diaries.get(request.diaryId) : null;
                  if (!sender || !diary) return null;

                  return (
                    <Card key={request.id} className="glass-effect border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarImage src={sender.profilePhoto} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {sender.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">{sender.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Wants to edit: <span className="text-foreground">{diary.caseNumber}</span>
                            </p>
                            {request.reason && (
                              <p className="text-sm bg-secondary/50 p-3 rounded-lg">
                                "{request.reason}"
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Requested {new Date(request.createdAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectEdit(request)}
                              className="border-destructive text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApproveEdit(request)}
                              className="gold-gradient text-primary-foreground"
                            >
                              <Check className="mr-1 h-4 w-4" />
                              Grant
                            </Button>
                          </div>
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
                    Partner edit requests will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            {permissions.length > 0 ? (
              <div className="space-y-4">
                {permissions.map((permission) => {
                  const partner = senders.get(permission.partnerId);
                  const diary = diaries.get(permission.diaryId);
                  if (!partner || !diary) return null;

                  return (
                    <Card key={permission.id} className="glass-effect border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                              <AvatarImage src={partner.profilePhoto} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {partner.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{partner.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Diary: <span className="text-foreground">{diary.caseNumber}</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Granted: {new Date(permission.grantedAt).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {permission.canEdit ? (
                              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                                Active
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full">
                                Used
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="glass-effect border-primary/20">
                <CardContent className="py-12 text-center">
                  <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-serif text-xl font-semibold mb-2">No Permission History</h3>
                  <p className="text-muted-foreground">
                    Granted edit permissions will appear here.
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
