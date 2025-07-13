import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    // Get security policies
    const policies = await db.collection('securityPolicies')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Transform policies data
    const securityPolicies = policies.map(policy => ({
      id: policy._id.toString(),
      name: policy.name,
      description: policy.description,
      enabled: policy.enabled,
      category: policy.category,
      rules: policy.rules || [],
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt
    }));

    // If no policies exist, create default ones
    if (securityPolicies.length === 0) {
      const defaultPolicies = [
        {
          name: 'Password Policy',
          description: 'Enforce strong password requirements',
          enabled: true,
          category: 'authentication',
          rules: [
            {
              id: '1',
              name: 'Minimum Length',
              condition: 'password.length >= 8',
              action: 'deny',
              enabled: true
            },
            {
              id: '2',
              name: 'Complexity Requirements',
              condition: 'password.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/)',
              action: 'deny',
              enabled: true
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Session Management',
          description: 'Manage user sessions and timeouts',
          enabled: true,
          category: 'authorization',
          rules: [
            {
              id: '3',
              name: 'Session Timeout',
              condition: 'session.inactive > 30 minutes',
              action: 'logout',
              enabled: true
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Rate Limiting',
          description: 'Prevent brute force attacks',
          enabled: true,
          category: 'network',
          rules: [
            {
              id: '4',
              name: 'Login Attempts',
              condition: 'failed_logins > 5 per hour',
              action: 'block',
              enabled: true
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Data Access Control',
          description: 'Control access to sensitive data',
          enabled: true,
          category: 'data_protection',
          rules: [
            {
              id: '5',
              name: 'Admin Only Access',
              condition: 'user.role !== "admin" && resource.sensitive',
              action: 'deny',
              enabled: true
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Insert default policies
      for (const policy of defaultPolicies) {
        await db.collection('securityPolicies').insertOne(policy);
      }

      // Return the default policies
      return NextResponse.json(defaultPolicies.map((policy, index) => ({
        id: `default-${index}`,
        ...policy
      })));
    }

    return NextResponse.json(securityPolicies);
  } catch (error) {
    console.error('Error fetching security policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security policies' },
      { status: 500 }
    );
  }
} 