import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Copy, Trash2, Plus, Eye, EyeOff, Key } from 'lucide-react';

interface ApiToken {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export const TokenManagement = () => {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenValue, setNewTokenValue] = useState<string | null>(null);
  const [showNewToken, setShowNewToken] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('api_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (error: any) {
      toast.error('Failed to load API tokens');
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const generateToken = async () => {
    if (!newTokenName.trim()) {
      toast.error('Please enter a token name');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Not authenticated');
        return;
      }

      const response = await supabase.functions.invoke('generate-api-token', {
        body: { name: newTokenName, expires_in_days: null },
      });

      if (response.error) throw response.error;

      setNewTokenValue(response.data.token);
      setShowNewToken(false);
      setNewTokenName('');
      toast.success('API token generated successfully!');
      await fetchTokens();
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate token');
      console.error('Error generating token:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeToken = async (tokenId: string) => {
    if (!confirm('Are you sure you want to revoke this token? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('api_tokens')
        .update({ is_active: false })
        .eq('id', tokenId);

      if (error) throw error;

      toast.success('Token revoked successfully');
      await fetchTokens();
    } catch (error: any) {
      toast.error('Failed to revoke token');
      console.error('Error revoking token:', error);
    }
  };

  const deleteToken = async (tokenId: string) => {
    if (!confirm('Are you sure you want to delete this token? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('api_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) throw error;

      toast.success('Token deleted successfully');
      await fetchTokens();
    } catch (error: any) {
      toast.error('Failed to delete token');
      console.error('Error deleting token:', error);
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success('Token copied to clipboard');
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setNewTokenValue(null);
    setNewTokenName('');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Key className="w-6 h-6" />
            API Tokens
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage API tokens for external integrations like your push-up tracker
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Generate Token
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New API Token</DialogTitle>
              <DialogDescription>
                {newTokenValue ? (
                  'Save this token securely - it will only be shown once!'
                ) : (
                  'Create a new API token for external integrations'
                )}
              </DialogDescription>
            </DialogHeader>

            {newTokenValue ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-sm mb-2 block">Your API Token</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-background p-2 rounded border break-all">
                      {showNewToken ? newTokenValue : '•'.repeat(64)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowNewToken(!showNewToken)}
                    >
                      {showNewToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => copyToken(newTokenValue)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    <strong>Warning:</strong> Make sure to copy this token now. You won't be able to see it again!
                  </p>
                </div>

                <Button onClick={closeDialog} className="w-full">
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="token-name">Token Name</Label>
                  <Input
                    id="token-name"
                    placeholder="e.g., Push-up Tracker"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && generateToken()}
                  />
                </div>
                <Button onClick={generateToken} disabled={loading} className="w-full">
                  Generate Token
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3 mt-6">
        {loading && tokens.length === 0 ? (
          <p className="text-muted-foreground text-sm">Loading tokens...</p>
        ) : tokens.length === 0 ? (
          <p className="text-muted-foreground text-sm">No API tokens yet. Generate one to get started!</p>
        ) : (
          tokens.map((token) => (
            <div
              key={token.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                token.is_active ? 'bg-card' : 'bg-muted opacity-60'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{token.name}</h3>
                  {!token.is_active && (
                    <span className="text-xs px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded">
                      Revoked
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Created {new Date(token.created_at).toLocaleDateString()}
                  {token.last_used_at && (
                    <> • Last used {new Date(token.last_used_at).toLocaleDateString()}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {token.is_active && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeToken(token.id)}
                  >
                    Revoke
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteToken(token.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};