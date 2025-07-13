'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface MFAMethod {
  id: string;
  type: 'email' | 'sms' | 'totp' | 'backup_codes';
  name: string;
  description: string;
  enabled: boolean;
  verified: boolean;
  lastUsed?: string;
}

interface BackupCode {
  code: string;
  used: boolean;
  usedAt?: string;
}

export default function TwoFactorAuth() {
  const [mfaMethods, setMfaMethods] = useState<MFAMethod[]>([]);
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
  const [totpSecret, setTotpSecret] = useState('');
  const [totpQrCode, setTotpQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupMode, setSetupMode] = useState<'select' | 'email' | 'sms' | 'totp' | 'backup'>('select');

  useEffect(() => {
    fetchMFAData();
  }, []);

  const fetchMFAData = async () => {
    try {
      setLoading(true);
      const [methodsRes, backupRes] = await Promise.all([
        fetch('/api/auth/mfa/methods'),
        fetch('/api/auth/mfa/backup-codes')
      ]);

      if (methodsRes.ok) {
        const methodsData = await methodsRes.json();
        setMfaMethods(methodsData);
      }

      if (backupRes.ok) {
        const backupData = await backupRes.json();
        setBackupCodes(backupData);
      }
    } catch (error) {
      console.error('Error fetching MFA data:', error);
      toast.error('Failed to fetch MFA data');
    } finally {
      setLoading(false);
    }
  };

  const setupTOTP = async () => {
    try {
      const response = await fetch('/api/auth/mfa/totp/setup', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setTotpSecret(data.secret);
        setTotpQrCode(data.qrCode);
        setSetupMode('totp');
      } else {
        toast.error('Failed to setup TOTP');
      }
    } catch (error) {
      console.error('Error setting up TOTP:', error);
      toast.error('Failed to setup TOTP');
    }
  };

  const verifyTOTP = async () => {
    try {
      const response = await fetch('/api/auth/mfa/totp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      });

      if (response.ok) {
        toast.success('TOTP verified successfully');
        setSetupMode('select');
        setVerificationCode('');
        fetchMFAData();
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying TOTP:', error);
      toast.error('Failed to verify TOTP');
    }
  };

  const setupEmailMFA = async () => {
    try {
      const response = await fetch('/api/auth/mfa/email/setup', {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Verification email sent');
        setSetupMode('email');
      } else {
        toast.error('Failed to setup email MFA');
      }
    } catch (error) {
      console.error('Error setting up email MFA:', error);
      toast.error('Failed to setup email MFA');
    }
  };

  const verifyEmailMFA = async () => {
    try {
      const response = await fetch('/api/auth/mfa/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      });

      if (response.ok) {
        toast.success('Email MFA verified successfully');
        setSetupMode('select');
        setVerificationCode('');
        fetchMFAData();
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying email MFA:', error);
      toast.error('Failed to verify email MFA');
    }
  };

  const setupSMSMFA = async () => {
    try {
      const response = await fetch('/api/auth/mfa/sms/setup', {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Verification SMS sent');
        setSetupMode('sms');
      } else {
        toast.error('Failed to setup SMS MFA');
      }
    } catch (error) {
      console.error('Error setting up SMS MFA:', error);
      toast.error('Failed to setup SMS MFA');
    }
  };

  const verifySMSMFA = async () => {
    try {
      const response = await fetch('/api/auth/mfa/sms/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      });

      if (response.ok) {
        toast.success('SMS MFA verified successfully');
        setSetupMode('select');
        setVerificationCode('');
        fetchMFAData();
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying SMS MFA:', error);
      toast.error('Failed to verify SMS MFA');
    }
  };

  const generateBackupCodes = async () => {
    try {
      const response = await fetch('/api/auth/mfa/backup-codes/generate', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setBackupCodes(data);
        setShowBackupCodes(true);
        setSetupMode('backup');
      } else {
        toast.error('Failed to generate backup codes');
      }
    } catch (error) {
      console.error('Error generating backup codes:', error);
      toast.error('Failed to generate backup codes');
    }
  };

  const toggleMFAMethod = async (methodId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/auth/mfa/methods/${methodId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      if (response.ok) {
        setMfaMethods(mfaMethods.map(m => 
          m.id === methodId ? { ...m, enabled } : m
        ));
        toast.success(`MFA method ${enabled ? 'enabled' : 'disabled'}`);
      } else {
        toast.error('Failed to update MFA method');
      }
    } catch (error) {
      console.error('Error updating MFA method:', error);
      toast.error('Failed to update MFA method');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadBackupCodes = () => {
    const codes = backupCodes.map(code => code.code).join('\n');
    const blob = new Blob([codes], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Backup codes downloaded');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Two-Factor Authentication</h2>
          <p className="text-muted-foreground">
            Secure your account with additional verification methods
          </p>
        </div>
        <Button onClick={fetchMFAData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* MFA Methods Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mfaMethods.map((method) => (
          <Card key={method.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {method.type === 'email' && <Mail className="h-4 w-4" />}
                  {method.type === 'sms' && <Smartphone className="h-4 w-4" />}
                  {method.type === 'totp' && <Key className="h-4 w-4" />}
                  {method.type === 'backup_codes' && <Shield className="h-4 w-4" />}
                  <span className="font-medium">{method.name}</span>
                </div>
                <Badge variant={method.enabled ? "default" : "secondary"}>
                  {method.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {method.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {method.verified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {method.verified ? 'Verified' : 'Not verified'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleMFAMethod(method.id, !method.enabled)}
                  disabled={!method.verified}
                >
                  {method.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Setup New MFA Method */}
      {setupMode === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle>Setup New MFA Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={setupTOTP}
              >
                <Key className="h-6 w-6" />
                <span>Authenticator App (TOTP)</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={setupEmailMFA}
              >
                <Mail className="h-6 w-6" />
                <span>Email Verification</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={setupSMSMFA}
              >
                <Smartphone className="h-6 w-6" />
                <span>SMS Verification</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={generateBackupCodes}
              >
                <Shield className="h-6 w-6" />
                <span>Backup Codes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TOTP Setup */}
      {setupMode === 'totp' && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Authenticator App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              {totpQrCode && (
                <div className="inline-block p-4 bg-white rounded-lg">
                  <img src={totpQrCode} alt="TOTP QR Code" className="w-48 h-48" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Manual Entry Code</label>
              <div className="flex items-center gap-2">
                <Input
                  value={totpSecret}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(totpSecret)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Code</label>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={verifyTOTP}>
                Verify & Enable
              </Button>
              <Button
                variant="outline"
                onClick={() => setSetupMode('select')}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email/SMS Verification */}
      {(setupMode === 'email' || setupMode === 'sms') && (
        <Card>
          <CardHeader>
            <CardTitle>
              Verify {setupMode === 'email' ? 'Email' : 'SMS'} Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the verification code sent to your {setupMode === 'email' ? 'email' : 'phone'}.
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Code</label>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter verification code"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={setupMode === 'email' ? verifyEmailMFA : verifySMSMFA}
              >
                Verify & Enable
              </Button>
              <Button
                variant="outline"
                onClick={() => setSetupMode('select')}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Codes */}
      {setupMode === 'backup' && (
        <Card>
          <CardHeader>
            <CardTitle>Backup Codes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Save these backup codes in a secure location. You can use them to access your account if you lose your other MFA methods.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBackupCodes(!showBackupCodes)}
              >
                {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {showBackupCodes && (
              <div className="space-y-4">
                <div className="grid gap-2 md:grid-cols-2">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg font-mono text-center ${
                        code.used ? 'bg-muted text-muted-foreground' : 'bg-background'
                      }`}
                    >
                      {code.code}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={downloadBackupCodes}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Codes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(backupCodes.map(c => c.code).join('\n'))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setSetupMode('select')}>
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 