import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Bell, Users, Calendar } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/layout/Header';
import { getDiariesByLawyer, getRequestsByReceiver, getPartnersByLawyer, getLawyersByPartner } from '@/lib/storage';
import { useState, useEffect } from 'react';
import { Diary, PartnerRelationship, Request } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lawyerDiaries, setLawyerDiaries] = useState<Diary[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]);
  const [partners, setPartners] = useState<PartnerRelationship[]>([]);
  const [connectedLawyers, setConnectedLawyers] = useState<PartnerRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) {
    navigate('/login');
    return null;
  }

  const isLawyer = user.role === 'lawyer';

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isLawyer) {
          const [diaries, requests, partnersList] = await Promise.all([
            getDiariesByLawyer(user.id),
            getRequestsByReceiver(user.id),
            getPartnersByLawyer(user.id)
          ]);
          setLawyerDiaries(diaries);
          setPendingRequests(requests);
          setPartners(partnersList);
        } else {
          const lawyers = await getLawyersByPartner(user.id);
          setConnectedLawyers(lawyers);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.id, isLawyer]);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold mb-2">
            Welcome back, {user.name}
          </h1>
          <p className="text-muted-foreground">{today}</p>
        </div>

        {/* Quick Actions */}
        {isLawyer && (
          <div className="mb-8">
            <Button
              onClick={() => navigate('/diaries/new')}
              className="gold-gradient text-primary-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Diary Entry
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {isLawyer ? (
            <>
              <Card className="glass-effect border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Diaries
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{lawyerDiaries.length}</div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Requests
                  </CardTitle>
                  <Bell className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingRequests.length}</div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Partners
                  </CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{partners.length}</div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Upcoming Hearings
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {lawyerDiaries.filter(d => new Date(d.matterDate) >= new Date()).length}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="glass-effect border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Connected Lawyers
                  </CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{connectedLawyers.length}</div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Accessible Diaries
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <Card className="glass-effect border-primary/20">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Recent Activity</CardTitle>
            <CardDescription>Your latest diary entries and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {isLawyer && lawyerDiaries.length > 0 ? (
              <div className="space-y-4">
                {lawyerDiaries.slice(0, 5).map((diary) => (
                  <div
                    key={diary.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/diaries/${diary.id}`)}
                  >
                    <div>
                      <p className="font-medium">{diary.caseNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {diary.courtName} • {diary.partyNames}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(diary.matterDate).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {isLawyer ? (
                  <>
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No diary entries yet.</p>
                    <Button
                      variant="link"
                      onClick={() => navigate('/diaries/new')}
                      className="text-primary"
                    >
                      Create your first entry
                    </Button>
                  </>
                ) : (
                  <>
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Connect with lawyers to view their diaries.</p>
                    <Button
                      variant="link"
                      onClick={() => navigate('/find-lawyers')}
                      className="text-primary"
                    >
                      Find Lawyers
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
