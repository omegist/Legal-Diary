import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Input } from '@/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/layout/Header';
import { searchLawyers, createRequest, getRequests, getPartnerRelationships } from '@/lib/storage';
import { LawyerProfile, Request } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';

export default function FindLawyers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LawyerProfile[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [requestStatuses, setRequestStatuses] = useState<Map<string, 'none' | 'pending' | 'accepted'>>(new Map());

  useEffect(() => {
    const loadStatuses = async () => {
      const statuses = new Map<string, 'none' | 'pending' | 'accepted'>();
      for (const lawyer of searchResults) {
        const status = await getRequestStatus(lawyer.id);
        statuses.set(lawyer.id, status);
      }
      setRequestStatuses(statuses);
    };
    if (searchResults.length > 0) {
      loadStatuses();
    }
  }, [searchResults]);

  if (!user || user.role !== 'partner') {
    navigate('/dashboard');
    return null;
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Enter Search Term',
        description: 'Please enter a lawyer name or enrollment number.',
        variant: 'destructive',
      });
      return;
    }

    const results = await searchLawyers(searchQuery);
    setSearchResults(results);
    setHasSearched(true);
  };

  const handleRequestPartner = async (lawyer: LawyerProfile) => {
    // Check if already a partner or has pending request
    const relationships = await getPartnerRelationships();
    const existingRelationship = relationships.find(
      r => r.lawyerId === lawyer.id && r.partnerId === user.id
    );

    if (existingRelationship) {
      if (existingRelationship.status === 'accepted') {
        toast({
          title: 'Already Connected',
          description: `You are already a partner with ${lawyer.name}.`,
          variant: 'destructive',
        });
        return;
      }
    }

    const requests = await getRequests();
    const existingRequest = requests.find(
      r => r.senderId === user.id && r.receiverId === lawyer.id && r.type === 'partner_request' && r.status === 'pending'
    );

    if (existingRequest) {
      toast({
        title: 'Request Pending',
        description: `You already have a pending request to ${lawyer.name}.`,
        variant: 'destructive',
      });
      return;
    }

    const newRequest: Request = {
      id: crypto.randomUUID(),
      type: 'partner_request',
      senderId: user.id,
      receiverId: lawyer.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await createRequest(newRequest);

    toast({
      title: 'Request Sent!',
      description: `Partnership request sent to ${lawyer.name}.`,
    });
  };

  const getRequestStatus = async (lawyerId: string): Promise<'none' | 'pending' | 'accepted'> => {
    const relationships = await getPartnerRelationships();
    const relationship = relationships.find(
      r => r.lawyerId === lawyerId && r.partnerId === user.id
    );
    if (relationship?.status === 'accepted') return 'accepted';

    const requests = await getRequests();
    const request = requests.find(
      r => r.senderId === user.id && r.receiverId === lawyerId && r.type === 'partner_request' && r.status === 'pending'
    );
    if (request) return 'pending';

    return 'none';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold mb-2">Find Lawyers</h1>
            <p className="text-muted-foreground">
              Search for lawyers to connect with and view their diaries
            </p>
          </div>

          {/* Search Box */}
          <div className="flex gap-2 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or enrollment number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-secondary/50"
              />
            </div>
            <Button onClick={handleSearch} className="gold-gradient text-primary-foreground">
              Search
            </Button>
          </div>

          {/* Results */}
          {hasSearched && (
            <>
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Found {searchResults.length} lawyer(s)
                  </p>
                  {searchResults.map((lawyer) => {
                    const status = requestStatuses.get(lawyer.id) || 'none';
                    
                    return (
                      <Card
                        key={lawyer.id}
                        className="glass-effect border-primary/20"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 border-2 border-primary/20">
                              <AvatarImage src={lawyer.profilePhoto} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                {lawyer.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-serif text-xl font-semibold mb-1">
                                {lawyer.name}
                              </h3>
                              {lawyer.practiceArea && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                                  <Briefcase className="h-3 w-3" />
                                  {lawyer.practiceArea}
                                </div>
                              )}
                              {lawyer.courtName && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                  <MapPin className="h-3 w-3" />
                                  {lawyer.courtName}
                                </div>
                              )}
                              {lawyer.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {lawyer.description}
                                </p>
                              )}
                            </div>
                            <div>
                              {status === 'accepted' ? (
                                <span className="text-sm text-primary font-medium">Connected</span>
                              ) : status === 'pending' ? (
                                <span className="text-sm text-muted-foreground">Request Pending</span>
                              ) : (
                                <Button
                                  onClick={() => handleRequestPartner(lawyer)}
                                  size="sm"
                                  className="gold-gradient text-primary-foreground"
                                >
                                  <UserPlus className="mr-1 h-4 w-4" />
                                  Request
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
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="font-serif text-xl font-semibold mb-2">No Lawyers Found</h3>
                    <p className="text-muted-foreground">
                      Try a different name or enrollment number.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!hasSearched && (
            <Card className="glass-effect border-primary/20">
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-serif text-xl font-semibold mb-2">Search for Lawyers</h3>
                <p className="text-muted-foreground">
                  Enter a lawyer's name or enrollment number to find and connect.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
