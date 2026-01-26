import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, UserCog, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getUserByEmail } from '@/lib/storage';
import { UserRole } from '@/types';

export default function GetStarted() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'credentials' | 'role'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Checking email:', email);
      const existingUser = await getUserByEmail(email);
      console.log('Existing user result:', existingUser);
      
      if (existingUser) {
        console.log('User exists, showing error');
        toast({
          title: 'Account Exists',
          description: 'An account with this email already exists. Please sign in instead.',
          variant: 'destructive',
        });
        return;
      }

      console.log('No user found, proceeding to role selection');
      setStep('role');
    } catch (error) {
      console.error('Error checking email:', error);
      toast({
        title: 'Error',
        description: 'Failed to check email. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    navigate(`/create-profile/${role}`, { state: { email, password } });
  };

  return (
    <div className="min-h-screen bg-background legal-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Scale className="h-10 w-10 text-primary" />
            <span className="font-serif text-2xl font-semibold text-gold-gradient">
              Legal Diary
            </span>
          </Link>
        </div>

        {step === 'credentials' && (
          <Card className="glass-effect border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">Create Account</CardTitle>
              <CardDescription>
                Enter your credentials to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
                <Button type="submit" className="w-full gold-gradient text-primary-foreground">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        {step === 'role' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold mb-2">Select Your Role</h2>
              <p className="text-muted-foreground">
                This cannot be changed later
              </p>
            </div>

            <Card
              className="glass-effect border-primary/20 cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => handleRoleSelect('lawyer')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCog className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-semibold">Lawyer / Associate</h3>
                  <p className="text-sm text-muted-foreground">
                    Create diaries, manage cases, control partner access
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card
              className="glass-effect border-primary/20 cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => handleRoleSelect('partner')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-semibold">Partner</h3>
                  <p className="text-sm text-muted-foreground">
                    View diaries, request edits, collaborate with lawyers
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setStep('credentials')}
            >
              Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
