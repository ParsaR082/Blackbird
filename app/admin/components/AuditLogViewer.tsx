'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Eye, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  User,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Database,
  Settings,
  Activity,
  Key,
  Fingerprint,
  RefreshCw,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: 'login' | 'logout' | 'failed_login' | 'password_change' | 'admin_action' | 'suspicious_activity' | 'data_access' | 'system_change' | 'user_creation' | 'user_deletion' | 'permission_change' | 'data_export' | 'api_access' | 'file_upload' | 'file_download';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  sessionId?: string;
  requestId?: string;
  resourceAccessed?: string;
  actionPerformed?: string;
  details?: any;
  metadata?: {
    browser?: string;
    os?: string;
    device?: string;
    country?: string;
    city?: string;
  };
}

interface AuditFilter {
  dateRange: {
    start: string;
    end: string;
  };
  eventTypes: string[];
  severities: string[];
  users: string[];
  ipAddresses: string[];
}

export default function AuditLogViewer() {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<AuditFilter>({
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    eventTypes: [],
    severities: [],
    users: [],
    ipAddresses: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    fetchAuditLog();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [auditEvents, filters, searchTerm]);

  const fetchAuditLog = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/security/audit-log');
      
      if (response.ok) {
        const data = await response.json();
        setAuditEvents(data);
      } else {
        toast.error('Failed to fetch audit log');
      }
    } catch (error) {
      console.error('Error fetching audit log:', error);
      toast.error('Failed to fetch audit log');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = auditEvents;

    // Date range filter
    filtered = filtered.filter(event => {
      const eventDate = new Date(event.timestamp);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      return eventDate >= startDate && eventDate <= endDate;
    });

    // Event type filter
    if (filters.eventTypes.length > 0) {
      filtered = filtered.filter(event => filters.eventTypes.includes(event.eventType));
    }

    // Severity filter
    if (filters.severities.length > 0) {
      filtered = filtered.filter(event => filters.severities.includes(event.severity));
    }

    // User filter
    if (filters.users.length > 0) {
      filtered = filtered.filter(event => event.userEmail && filters.users.includes(event.userEmail));
    }

    // IP address filter
    if (filters.ipAddresses.length > 0) {
      filtered = filtered.filter(event => event.ipAddress && filters.ipAddresses.includes(event.ipAddress));
    }

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.ipAddress?.includes(searchTerm) ||
        event.resourceAccessed?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const exportAuditLog = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const response = await fetch(`/api/admin/security/export-audit?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Audit log exported as ${format.toUpperCase()}`);
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
      case 'user_creation': return <User className="h-4 w-4 text-green-500" />;
      case 'user_deletion': return <User className="h-4 w-4 text-red-500" />;
      case 'permission_change': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'data_export': return <Download className="h-4 w-4 text-purple-500" />;
      case 'api_access': return <Globe className="h-4 w-4 text-indigo-500" />;
      case 'file_upload': return <Upload className="h-4 w-4 text-green-500" />;
      case 'file_download': return <Download className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    return eventType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const clearFilters = () => {
    setFilters({
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      eventTypes: [],
      severities: [],
      users: [],
      ipAddresses: []
    });
    setSearchTerm('');
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
          <h2 className="text-2xl font-bold tracking-tight">Audit Log Viewer</h2>
          <p className="text-muted-foreground">
            Detailed security event analysis and audit trail
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAuditLog} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button onClick={() => exportAuditLog('csv')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                  />
                  <Input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Event Types</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {['login', 'logout', 'failed_login', 'password_change', 'admin_action', 'suspicious_activity', 'data_access', 'system_change'].map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.eventTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({
                              ...prev,
                              eventTypes: [...prev.eventTypes, type]
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              eventTypes: prev.eventTypes.filter(t => t !== type)
                            }));
                          }
                        }}
                      />
                      <span className="text-sm">{getEventTypeLabel(type)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Severities</label>
                <div className="space-y-1">
                  {['critical', 'high', 'medium', 'low'].map(severity => (
                    <label key={severity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.severities.includes(severity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({
                              ...prev,
                              severities: [...prev.severities, severity]
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              severities: prev.severities.filter(s => s !== severity)
                            }));
                          }
                        }}
                      />
                      <span className="text-sm capitalize">{severity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <div className="space-y-2">
                  <Button onClick={clearFilters} variant="outline" size="sm" className="w-full">
                    Clear Filters
                  </Button>
                  <Button onClick={() => setShowFilters(false)} variant="outline" size="sm" className="w-full">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search audit events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredEvents.length} of {auditEvents.length} events
        </p>
        <div className="flex gap-2">
          <Badge variant="outline">
            Critical: {filteredEvents.filter(e => e.severity === 'critical').length}
          </Badge>
          <Badge variant="outline">
            High: {filteredEvents.filter(e => e.severity === 'high').length}
          </Badge>
          <Badge variant="outline">
            Medium: {filteredEvents.filter(e => e.severity === 'medium').length}
          </Badge>
          <Badge variant="outline">
            Low: {filteredEvents.filter(e => e.severity === 'low').length}
          </Badge>
        </div>
      </div>

      {/* Audit Events */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No audit events found matching your criteria
              </div>
            ) : (
              <div className="divide-y">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEventModal(true);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {getEventIcon(event.eventType)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{event.description}</span>
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <Badge variant="outline">
                            {getEventTypeLabel(event.eventType)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-4">
                            {event.userEmail && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {event.userEmail}
                              </span>
                            )}
                            {event.ipAddress && (
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {event.ipAddress}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {event.resourceAccessed && (
                            <div className="text-xs">
                              Resource: {event.resourceAccessed}
                            </div>
                          )}
                        </div>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Event Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEventModal(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Event Type</label>
                  <p className="text-sm">{getEventTypeLabel(selectedEvent.eventType)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <Badge className={getSeverityColor(selectedEvent.severity)}>
                    {selectedEvent.severity}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Timestamp</label>
                  <p className="text-sm">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">User</label>
                  <p className="text-sm">{selectedEvent.userEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">IP Address</label>
                  <p className="text-sm">{selectedEvent.ipAddress || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <p className="text-sm">{selectedEvent.location || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm">{selectedEvent.description}</p>
              </div>
              
              {selectedEvent.resourceAccessed && (
                <div>
                  <label className="text-sm font-medium">Resource Accessed</label>
                  <p className="text-sm">{selectedEvent.resourceAccessed}</p>
                </div>
              )}
              
              {selectedEvent.actionPerformed && (
                <div>
                  <label className="text-sm font-medium">Action Performed</label>
                  <p className="text-sm">{selectedEvent.actionPerformed}</p>
                </div>
              )}
              
              {selectedEvent.metadata && (
                <div>
                  <label className="text-sm font-medium">Metadata</label>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedEvent.details && (
                <div>
                  <label className="text-sm font-medium">Additional Details</label>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedEvent.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 