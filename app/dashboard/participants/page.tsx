'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../src/lib/supabase/client'; // Corrected relative path
import type { Database } from '../../../src/lib/supabase/database.types'; // Corrected relative path
import { ParticipantTable } from '@/components/participant-table'; // Import reusable component
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // For action buttons
import { Download, Upload, Users } from 'lucide-react'; // Icons for buttons

// Define the type for a registrant row we expect to fetch
type RegistrantRow = Database['public']['Tables']['registrants']['Row'];

export default function ManageParticipantsPage() {
  const [registrants, setRegistrants] = useState<RegistrantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRegistrants() {
      setLoading(true);
      setError(null);
      try {
        // Task 6.2: Fetch all *eligible* registrants (age >= 12)
        const { data, error: fetchError } = await supabase
          .from('registrants')
          .select('*')
          .gte('age', 12) // Filter for age 12 and up
          .order('created_at', { ascending: false }); // Order by creation time

        if (fetchError) {
          throw fetchError;
        }

        setRegistrants(data || []);
      } catch (err: any) {
        console.error("Error fetching registrants:", err);
        setError(err.message || "Failed to fetch registrants.");
        setRegistrants([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRegistrants();
  }, []);

  const handleManualGroupTrigger = async () => {
      alert("Manual group assignment trigger not implemented yet.");
      // TODO: Implement Task 6.5 - Call grouping logic for all ungrouped
      // e.g., supabase.rpc('assign_all_ungrouped_registrants') or client-side loop
  };

  const handleExport = () => {
      alert("Export function not implemented yet.");
      // TODO: Implement Task 6.4 / Phase 4
  };

   const handleImport = () => {
      alert("Import function not implemented yet.");
      // TODO: Implement Task 6.4 / Phase 5
  };


  return (
    <div className="py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           <div>
             <CardTitle className="text-2xl font-bold">Manage Participants</CardTitle>
             <CardDescription>View and manage all eligible camp registrants.</CardDescription>
           </div>
           <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleImport}>
                    <Upload className="mr-2 h-4 w-4" /> Import
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export
                </Button>
                <Button variant="outline" size="sm" onClick={handleManualGroupTrigger}>
                    <Users className="mr-2 h-4 w-4" /> Assign Groups
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          {/* TODO: Add filtering/tabs for groups (Task 6.3) */}
          
          {loading && <p>Loading registrants...</p>}
          {error && <p className="text-red-600">Error: {error}</p>}
          {!loading && !error && (
            <ParticipantTable
              registrants={registrants}
              caption="A list of all registered participants (Age 12+)."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 