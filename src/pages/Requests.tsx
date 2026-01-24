import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, UserPlus, Edit, Bell } from 'lucide-react';
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
  grantEditPermission
} from '@/lib/storage';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Request, PartnerRelationship, DiaryEditPermission } from '@/types';

export default function Requests() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!user || user.role !== 'lawyer') {
    navigate('/dashboard');
    return null;
  }

  const requests = getRequestsByReceiver(user.id);
  const partnerRequests = requests.filter(r => r.type === 'partner_request');
  const editRequests = requests.filter(r => r.type === 'edit_request');

  const handleApprovePartner = (request: Request) => {
    // Create partner relationship
    const relationship: PartnerRelationship = {
      id: crypto.randomUUID(),
      lawyerId: user.id,
      partnerId: request.senderId,
      status: 'accepted',
      createdAt: new Date().toISOString(),
    };
    createPartnerRelationship(relationship);
    
    // Update request status
    updateRequest(request.id, 'approved');
    
    const sender = getUserById(request.senderId);
    toast({
      title: 'Partner Added',
      description: `${sender?.name} is now your partner.`,
    });
    
    setRefreshKey(prev => prev + 1);
  };

  const handleRejectPartner = (request: Request) => {
    updateRequest(request.id, 'rejected');
    toast({
      title: 'Request Rejected',
      description: 'The partnership request has been declined.',
    });
    setRefreshKey(prev => prev + 1);
  };

  const handleApproveEdit = (request: Request) => {
    if (!request.diaryId) return;
    
    const permission: DiaryEditPermission = {
      id: crypto.randomUUID(),
      diaryId: request.diaryId,
      partnerId: request.senderId,
      canEdit: true,
      grantedAt: new Date().toISOString(),
    };
    grantEditPermission(permission);
    
    updateRequest(request.id, 'approved');
    
    const sender = getUserById(request.senderId);
    const diary = getDiaryById(request.diaryId);
    toast({
      title: 'Edit Permission Granted',
      description: `${sender?.name} can now edit ${diary?.caseNumber}.`,
    });
    
    setRefreshKey(prev => prev + 1);
  };

  const handleRejectEdit = (request: Request) => {
    updateRequest(request.id, 'rejected');
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
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
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
          </TabsList>

          <TabsContent value="partners">
            {partnerRequests.length > 0 ? (
              <div className="space-y-4">
                {partnerRequests.map((request) => {
                  const sender = getUserById(request.senderId);
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
                  const sender = getUserById(request.senderId);
                  const diary = request.diaryId ? getDiaryById(request.diaryId) : null;
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
        </Tabs>
      </main>
    </div>
  );
}
