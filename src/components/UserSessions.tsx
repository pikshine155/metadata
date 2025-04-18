
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Globe, Clock, Monitor } from 'lucide-react';
import { UserSession } from '@/types/supabase';

const UserSessions = () => {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: async () => {
      // Use the edge function to get user sessions
      const { data, error } = await supabase.functions.invoke('get_user_sessions', {
        body: {},
      });
      
      if (error) throw error;
      return data as UserSession[];
    }
  });

  if (isLoading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg p-4 mt-4">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Globe className="mr-2 h-5 w-5" />
        Active Sessions
      </h2>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Last Seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions?.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="text-gray-300">
                  {session.city && session.country 
                    ? `${session.city}, ${session.country}`
                    : 'Unknown location'}
                </TableCell>
                <TableCell className="text-gray-300">{session.ip_address}</TableCell>
                <TableCell className="text-gray-300 flex items-center">
                  <Monitor className="mr-2 h-4 w-4" />
                  {session.user_agent?.split('/')[0] || 'Unknown device'}
                </TableCell>
                <TableCell className="text-gray-300 flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {format(new Date(session.last_seen), 'MMM dd, yyyy HH:mm')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserSessions;
