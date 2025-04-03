
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { testSupabaseConnection, checkRlsStatus, getSupabaseClientInfo } from "@/utils/supabaseUtils";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface ConnectionStatus {
  connected: boolean;
  error: any;
  message: string;
}

interface RlsStatus {
  blocking: boolean | 'maybe' | 'unknown' | string;
  message: string;
}

/**
 * A diagnostic component to check Supabase connection status
 * For admin/troubleshooting use only
 */
const SupabaseConnectionCheck = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [rlsStatus, setRlsStatus] = useState<RlsStatus | null>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkConnection = async () => {
    setLoading(true);
    try {
      setClientInfo(getSupabaseClientInfo());
      
      const status = await testSupabaseConnection();
      setConnectionStatus(status);
      
      if (status.connected) {
        const rls = await checkRlsStatus();
        setRlsStatus(rls);
      }
    } catch (e) {
      console.error("Error in connection check:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Supabase Connection Diagnostics
          {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
        </CardTitle>
        <CardDescription>
          Check your database connection status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Client Configuration</h3>
          {clientInfo ? (
            <div className="text-sm">
              <p><span className="font-semibold">URL:</span> {clientInfo.url}</p>
              <p>
                <span className="font-semibold">API Key:</span> {' '}
                {clientInfo.hasKey ? (
                  <span className="text-green-600">Present ({clientInfo.keyLength} chars)</span>
                ) : (
                  <span className="text-red-600">Missing</span>
                )}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading client info...</p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Connection Status</h3>
          {connectionStatus ? (
            <div className="flex items-center gap-2">
              {connectionStatus.connected ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={connectionStatus.connected ? "text-green-600" : "text-red-600"}>
                {connectionStatus.message}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Checking connection...</p>
          )}
        </div>

        {rlsStatus && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Row Level Security (RLS)</h3>
            <div className="flex items-center gap-2">
              {rlsStatus.blocking === true ? (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              ) : rlsStatus.blocking === 'maybe' ? (
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              ) : rlsStatus.blocking === 'unknown' ? (
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              <span className={
                rlsStatus.blocking === true ? "text-amber-600" : 
                rlsStatus.blocking === 'maybe' ? "text-amber-400" : 
                rlsStatus.blocking === 'unknown' ? "text-muted-foreground" : 
                "text-green-600"
              }>
                {rlsStatus.message}
              </span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={checkConnection}
          disabled={loading} 
          className="w-full"
        >
          {loading && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
          Re-check Connection
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SupabaseConnectionCheck;
