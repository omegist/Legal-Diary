import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, BookOpen, Calendar, Filter, Edit } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Input } from '@/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/layout/Header';
import { useToast } from '@/hooks/use-toast';
import { getDiariesByLawyer, getLawyersByPartner, getUserById, getDiaries, createRequest, getRequests, canPartnerEditDiary } from '@/lib/storage';
import { Diary } from '@/types';

export default function Diaries() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const isLawyer = user.role === 'lawyer';

  const handleRequestEdit = (e: React.MouseEvent, diaryId: string, lawyerId: string) => {
    e.stopPropagation();
    
    // Check if already has permission
    if (canPartnerEditDiary(user.id, diaryId)) {
      toast({
        title: "Already have access",
        description: "You already have edit permission for this diary.",
      });
      return;
    }

    // Check if request already exists
    const existingRequest = getRequests().find(
      r => r.senderId === user.id && 
           r.receiverId === lawyerId && 
           r.diaryId === diaryId && 
           r.status === 'pending'
    );

    if (existingRequest) {
      toast({
        title: "Request pending",
        description: "You already have a pending edit request for this diary.",
      });
      return;
    }

    // Create edit request
    createRequest({
      id: crypto.randomUUID(),
      type: 'edit_request',
      senderId: user.id,
      receiverId: lawyerId,
      diaryId: diaryId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    toast({
      title: "Request sent",
      description: "Edit permission request sent to the lawyer.",
    });
  };

  // Get diaries based on role
  let diaries: Diary[] = [];
  if (isLawyer) {
    diaries = getDiariesByLawyer(user.id);
  } else {
    // Partner: Get diaries from connected lawyers
    const connections = getLawyersByPartner(user.id);
    const allDiaries = getDiaries();
    diaries = allDiaries.filter(d => 
      connections.some(c => c.lawyerId === d.lawyerId)
    );
  }

  // Filter diaries based on search
  const filteredDiaries = diaries.filter(diary =>
    diary.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    diary.partyNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
    diary.courtName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by date (newest first)
  filteredDiaries.sort((a, b) => 
    new Date(b.matterDate).getTime() - new Date(a.matterDate).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold">Diaries</h1>
            <p className="text-muted-foreground">
              {isLawyer ? 'Manage your case diary entries' : 'View connected lawyers\' diaries'}
            </p>
          </div>
          
          {isLawyer && (
            <Button
              onClick={() => navigate('/diaries/new')}
              className="gold-gradient text-primary-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by case number, party name, or court..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Diaries List */}
        {filteredDiaries.length > 0 ? (
          <div className="grid gap-4">
            {filteredDiaries.map((diary) => {
              const lawyerInfo = !isLawyer ? getUserById(diary.lawyerId) : null;
              
              return (
                <Card
                  key={diary.id}
                  className="glass-effect border-primary/20 cursor-pointer hover:border-primary/40 transition-all"
                  onClick={() => navigate(`/diaries/${diary.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                            {diary.caseType}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {diary.caseNumber}
                          </span>
                        </div>
                        <h3 className="font-serif text-lg font-semibold mb-1">
                          {diary.partyNames}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {diary.courtName} • {diary.stageOfCase}
                        </p>
                        {!isLawyer && lawyerInfo && (
                          <p className="text-xs text-primary mt-2">
                            Lawyer: {lawyerInfo.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(diary.matterDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {diary.purposeOfHearing}
                          </p>
                        </div>
                        {!isLawyer && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleRequestEdit(e, diary.id, diary.lawyerId)}
                            className="border-primary/20 hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Request Edit
                          </Button>
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
            <CardContent className="py-16 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-serif text-xl font-semibold mb-2">No Diary Entries</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? 'No entries match your search.'
                  : isLawyer
                  ? 'Start by creating your first diary entry.'
                  : 'Connect with lawyers to view their diaries.'}
              </p>
              {isLawyer && !searchQuery && (
                <Button
                  onClick={() => navigate('/diaries/new')}
                  className="gold-gradient text-primary-foreground"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Entry
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
