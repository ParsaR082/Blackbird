'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Globe,
  Database,
  Zap,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Search,
  BarChart3,
  Activity,
  Key,
  Fingerprint,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'login' | 'logout' | 'failed_login' | 'password_change' | 'admin_action' | 'suspicious_activity' | 'data_access' | 'system_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  details?: any;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'authentication' | 'authorization' | 'data_protection' | 'network' | 'monitoring';
  rules: SecurityRule[];
  createdAt: string;
  updatedAt: string;
}

interface SecurityRule {
  id: string;
  name: string;
  condition: string;
  action: 'allow' | 'deny' | 'alert' | 'block';
  enabled: boolean;
}

interface MFASettings {
  enabled: boolean;
  methods: ('email' | 'sms' | 'totp' | 'backup_codes')[];
  requiredForAdmins: boolean;
  requiredForUsers: boolean;
  gracePeriod: number; // days
}

interface ThreatDetection {
  enabled: boolean;
  suspiciousLoginAttempts: number;
  failedLoginThreshold: number;
  ipBlockingEnabled: boolean;
  geoBlockingEnabled: boolean;
  rateLimitingEnabled: boolean;
}

export default function SecurityCenter() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [mfaSettings, setMfaSettings] = useState<MFASettings | null>(null);
  const [threatDetection, setThreatDetection] = useState<ThreatDetection | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const [eventsRes, policiesRes, mfaRes, threatRes] = await Promise.all([
        fetch('/api/admin/security/events'),
        fetch('/api/admin/security/policies'),
        fetch('/api/admin/security/mfa'),
        fetch('/api/admin/security/threat-detection')
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setSecurityEvents(eventsData);
      }

      if (policiesRes.ok) {
        const policiesData = await policiesRes.json();
        setPolicies(policiesData);
      }

      if (mfaRes.ok) {
        const mfaData = await mfaRes.json();
        setMfaSettings(mfaData);
      }

      if (threatRes.ok) {
        const threatData = await threatRes.json();
        setThreatDetection(threatData);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast.error('Failed to fetch security data');
    } finally {
      setLoading(false);
    }
  };

  const togglePolicy = async (policyId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/security/policies/${policyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      if (response.ok) {
        setPolicies(policies.map(p => 
          p.id === policyId ? { ...p, enabled } : p
        ));
        toast.success(`Policy ${enabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        toast.error('Failed to update policy');
      }
    } catch (error) {
      console.error('Error updating policy:', error);
      toast.error('Failed to update policy');
    }
  };

  const updateMFASettings = async (settings: Partial<MFASettings>) => {
    try {
      const response = await fetch('/api/admin/security/mfa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMfaSettings(prev => prev ? { ...prev, ...settings } : null);
        toast.success('MFA settings updated successfully');
      } else {
        toast.error('Failed to update MFA settings');
      }
    } catch (error) {
      console.error('Error updating MFA settings:', error);
      toast.error('Failed to update MFA settings');
    }
  };

  const updateThreatDetection = async (settings: Partial<ThreatDetection>) => {
    try {
      const response = await fetch('/api/admin/security/threat-detection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setThreatDetection(prev => prev ? { ...prev, ...settings } : null);
        toast.success('Threat detection settings updated successfully');
      } else {
        toast.error('Failed to update threat detection settings');
      }
    } catch (error) {
      console.error('Error updating threat detection:', error);
      toast.error('Failed to update threat detection settings');
    }
  };

  const exportAuditLog = async () => {
    try {
      const response = await fetch('/api/admin/security/export-audit');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Audit log exported successfully');
      } else {
        toast.error('Failed to export audit log');
      }
    } catch (error) {
      console.error('Error exporting audit log:', error);
      toast.error('Failed to export audit log');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'login': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'logout': return <User className="h-4 w-4 text-blue-500" />;
      case 'failed_login': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'password_change': return <Key className="h-4 w-4 text-yellow-500" />;
      case 'admin_action': return <Shield className="h-4 w-4 text-purple-500" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'data_access': return <Database className="h-4 w-4 text-blue-500" />;
      case 'system_change': return <Settings className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.ipAddress?.includes(searchTerm);
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

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
          <h2 className="text-2xl font-bold tracking-tight">Security Center</h2>
          <p className="text-muted-foreground">
            Advanced security management, threat detection, and audit logging
          </p>
        </div>
        <Button onClick={fetchSecurityData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Security Overview Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policies.filter(p => p.enabled).length}</div>
            <p className="text-xs text-muted-foreground">
              of {policies.length} total policies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              {securityEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MFA Status</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mfaSettings?.enabled ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {mfaSettings?.methods?.length || 0} methods configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Detection</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {threatDetection?.enabled ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {threatDetection?.suspiciousLoginAttempts || 0} suspicious attempts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* MFA Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Multi-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Enable MFA</h4>
                <p className="text-sm text-muted-foreground">
                  Require additional verification for user accounts
                </p>
              </div>
              <Switch
                checked={mfaSettings?.enabled || false}
                onCheckedChange={(enabled) => updateMFASettings({ enabled })}
              />
            </div>

            {mfaSettings?.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Required for Admins</h4>
                    <p className="text-sm text-muted-foreground">
                      Force MFA for all admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={mfaSettings?.requiredForAdmins || false}
                    onCheckedChange={(requiredForAdmins) => updateMFASettings({ requiredForAdmins })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Required for Users</h4>
                    <p className="text-sm text-muted-foreground">
                      Force MFA for all user accounts
                    </p>
                  </div>
                  <Switch
                    checked={mfaSettings?.requiredForUsers || false}
                    onCheckedChange={(requiredForUsers) => updateMFASettings({ requiredForUsers })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Grace Period (days)</label>
                  <Input
                    type="number"
                    value={mfaSettings?.gracePeriod || 7}
                    onChange={(e) => updateMFASettings({ gracePeriod: parseInt(e.target.value) })}
                    min="1"
                    max="30"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Threat Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Threat Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Enable Threat Detection</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor for suspicious activities and potential threats
                </p>
              </div>
              <Switch
                checked={threatDetection?.enabled || false}
                onCheckedChange={(enabled) => updateThreatDetection({ enabled })}
              />
            </div>

            {threatDetection?.enabled && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Failed Login Threshold</label>
                  <Input
                    type="number"
                    value={threatDetection?.failedLoginThreshold || 5}
                    onChange={(e) => updateThreatDetection({ failedLoginThreshold: parseInt(e.target.value) })}
                    min="1"
                    max="20"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">IP Blocking</h4>
                    <p className="text-sm text-muted-foreground">
                      Block IPs with suspicious activity
                    </p>
                  </div>
                  <Switch
                    checked={threatDetection?.ipBlockingEnabled || false}
                    onCheckedChange={(ipBlockingEnabled) => updateThreatDetection({ ipBlockingEnabled })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Rate Limiting</h4>
                    <p className="text-sm text-muted-foreground">
                      Limit API requests per IP
                    </p>
                  </div>
                  <Switch
                    checked={threatDetection?.rateLimitingEnabled || false}
                    onCheckedChange={(rateLimitingEnabled) => updateThreatDetection({ rateLimitingEnabled })}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={policy.enabled}
                    onCheckedChange={(enabled) => togglePolicy(policy.id, enabled)}
                  />
                  <div>
                    <h4 className="font-medium">{policy.name}</h4>
                    <p className="text-sm text-muted-foreground">{policy.description}</p>
                    <Badge variant="outline" className="mt-1">{policy.category}</Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPolicy(policy);
                    setShowPolicyModal(true);
                  }}
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Security Audit Log
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={exportAuditLog} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Events List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No security events found
                </p>
              ) : (
                filteredEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {getEventIcon(event.eventType)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.description}</span>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {event.userEmail && `${event.userEmail} • `}
                        {event.ipAddress && `${event.ipAddress} • `}
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { SecurityCenter }; 