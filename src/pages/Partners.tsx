import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserMinus, Users, Shield } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/layout/Header';
import { getPartnersByLawyer, updatePartnerRelationship, getUserById, getEditPermissions, revokeEditPermission, getDiaryById } from '@/lib/storage';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { PartnerProfile, PartnerRelationship, DiaryEditPermission } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/ui/alert-dialog';
import { Badge } from '@/ui/badge';

export default function Partners() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [partnerRelationships, setPartnerRelationships] = useState<PartnerRelationship[]>([]);
  const [partners, setPartners] = useState<Map<string, PartnerProfile>>(new Map());
  const [editPermissions, setEditPermissions] = useState<DiaryEditPermission[]>([]);
  const [diaries, setDiaries] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPartners = async () => {
      if (!user) return;
      try {
        const relationships = await getPartnersByLawyer(user.id);
        setPartnerRelationships(relationships);
        
        const permissions = await getEditPermissions();
        setEditPermissions(permissions);
        
        // Load partner details
        const partnerMap = new Map();
        for (const rel of relationships) {
          const partner = await getUserById(rel.partnerId);
          if (partner) partnerMap.set(rel.partnerId, partner);
        }
        setPartners(partnerMap);
        
        // Load diary details for permissions
        const diaryMap = new Map();
        for (const perm of permissions) {
          if (!diaryMap.has(perm.diaryId)) {
            const diary = await getDiaryById(perm.diaryId);
            if (diary) diaryMap.set(perm.diaryId, diary);
          }
        }
        setDiaries(diaryMap);
      } catch (error) {
        console.error('Error loading partners:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPartners();
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
            <p className="mt-4 text-muted-foreground">Loading partners...</p>
          </div>
        </main>
      </div>
    );
  }

  const handleRemovePartner = async (relationshipId: string, partnerName: string) => {
    await updatePartnerRelationship(relationshipId, 'removed');
    toast({
      title: 'Partner Removed',
      description: `${partnerName} has been removed from your partners.`,
    });
    setRefreshKey(prev => prev + 1);
  };

  const handleRevokePermission = async (partnerId: string, diaryId: string) => {
    await revokeEditPermission(partnerId, diaryId);
    toast({
      title: 'Permission Revoked',
      description: 'Edit permission has been revoked.',
    });
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold mb-2">Your Partners</h1>
          <p className="text-muted-foreground">
            Manage your connected partners and their permissions
          </p>
        </div>

        {partnerRelationships.length > 0 ? (
          <div className="space-y-4">
            {partnerRelationships.map((relationship) => {
              const partner = partners.get(relationship.partnerId);
              if (!partner) return null;

              // Get edit permissions for this partner
              const partnerPermissions = editPermissions.filter(
                p => p.partnerId === partner.id && p.canEdit
              );

              return (
                <Card key={relationship.id} className="glass-effect border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={partner.profilePhoto} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                          {partner.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl font-semibold">{partner.name}</h3>
                        <p className="text-sm text-muted-foreground">{partner.phone}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Partner since {new Date(relationship.createdAt).toLocaleDateString('en-IN')}
                        </p>

                        {/* Edit Permissions */}
                        {partnerPermissions.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">Edit Permissions</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {partnerPermissions.map((perm) => {
                                const diary = diaries.get(perm.diaryId);
                                if (!diary) return null;
                                return (
                                  <Badge
                                    key={perm.id}
                                    variant="secondary"
                                    className="flex items-center gap-1 cursor-pointer hover:bg-destructive/20"
                                    onClick={() => handleRevokePermission(partner.id, perm.diaryId)}
                                  >
                                    {diary.caseNumber}
                                    <span className="text-destructive ml-1">×</span>
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive/10"
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Partner?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {partner.name} will no longer be able to view your diaries. 
                              All edit permissions will be revoked.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemovePartner(relationship.id, partner.name)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Remove Partner
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="glass-effect border-primary/20">
            <CardContent className="py-16 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-serif text-xl font-semibold mb-2">No Partners Yet</h3>
              <p className="text-muted-foreground">
                When partners connect with you, they'll appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
