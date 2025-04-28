'use client'; // Convert to client component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from '../src/lib/supabase/client'; // Assuming default alias setup
import type { Database } from '../src/lib/supabase/database.types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Download, Loader2, AlertCircle, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
// We'll need a new export function later
// import { exportGroupData } from '@/lib/excelUtils/export'; // Placeholder

type RegistrantRow = Database['public']['Tables']['registrants']['Row'];

// Structure to hold grouped data
interface GroupedData {
  [groupKey: string]: RegistrantRow[]; // Key can be group number (string) or 'Unassigned'
}

export default function Home() {
  const [registrants, setRegistrants] = useState<RegistrantRow[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [isExporting, setIsExporting] = useState(false);

  // Fetch Registrants and Group Them
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('registrants')
          .select('*')
          .gte('age', 12) // Only include eligible participants
          .order('assigned_group', { ascending: true, nullsFirst: false }) // Group numerically, then handle nulls
          .order('full_name', { ascending: true }); // Sort by name within groups

        if (fetchError) {
          throw fetchError;
        }

        setRegistrants(data || []);

        // Process data for grouping with explicit types
        const groups: GroupedData = (data || []).reduce((acc: GroupedData, registrant: RegistrantRow) => {
          const groupKey = registrant.assigned_group === null ? 'Unassigned' : `Group ${registrant.assigned_group}`;
          if (!acc[groupKey]) {
            acc[groupKey] = [];
          }
          acc[groupKey].push(registrant);
          return acc;
        }, {} as GroupedData);

        setGroupedData(groups);

      } catch (err: any) {
        console.error("Error fetching registrant data:", err);
        setError("Failed to load group details. Please try refreshing.");
        setRegistrants([]);
        setGroupedData({});
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- Placeholder Functions (to be implemented) ---
  const handleSearch = () => {
      setIsSearching(true);
      setSearchResult(null);
      console.log(`Searching for: ${searchTerm}`);
      // Simple client-side search
       setTimeout(() => { // Simulate search delay
           const found = registrants.find(r => r.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
           if (found) {
                const groupName = found.assigned_group === null ? 'Unassigned' : `Group ${found.assigned_group}`;
               setSearchResult(`${found.full_name} is in ${groupName}.`);
           } else {
               setSearchResult(`Participant "${searchTerm}" not found.`);
           }
           setIsSearching(false);
       }, 500);
       if (!searchTerm) {
            setSearchResult("Please enter a name to search.");
            setIsSearching(false);
       }
  };

  const handleGroupExport = async () => {
      setIsExporting(true);
      console.log("Exporting group data...");
      toast.warning("Group export functionality not implemented yet.");
      // TODO: Create and call exportGroupData(groupedData) utility
      // await exportGroupData(groupedData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate
      setIsExporting(false);
  };
  // --- End Placeholder Functions ---


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
      <Card className="w-full max-w-4xl shadow-lg mb-8">
        {/* Header Section */}
        <CardHeader className="text-center">
          {/* You could potentially add the logo here if desired */}
          {/* <Image src="/path-to-logo.png" alt="The Potter's House Logo" width={150} height={50} className="mx-auto mb-4" /> */}
          <CardTitle className="text-3xl font-bold text-blue-900 tracking-tight sm:text-4xl">
            Laguna District Family Camp 2025
          </CardTitle>
          <CardDescription className="mt-2 text-lg text-teal-700 font-semibold">
            May 1-2, 2025
          </CardDescription>
        </CardHeader>

        {/* Search Section */}
        <CardContent className="pt-0 pb-4">
            <div className="flex w-full max-w-sm items-center space-x-2 mx-auto">
                <Input
                    type="text"
                    placeholder="Find participant's group..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    disabled={isSearching || loading}
                />
                <Button type="button" onClick={handleSearch} disabled={isSearching || loading || !searchTerm}>
                    {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Search
                </Button>
            </div>
            {searchResult && (
                <div className={`mt-3 text-center text-sm p-2 rounded-md ${searchResult.includes('not found') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                     {searchResult.includes('not found') || searchResult.includes('Please enter') ? <UserX className="inline h-4 w-4 mr-1"/> : <UserCheck className="inline h-4 w-4 mr-1"/>}
                    {searchResult}
                </div>
            )}
        </CardContent>

        {/* Group Display Section */}
        <CardContent>
            <div className="mt-2 pt-4 border-t flex justify-between items-center">
                 <h3 className="text-xl font-semibold text-gray-700">Camp Group Assignments</h3>
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGroupExport}
                    disabled={isExporting || loading || Object.keys(groupedData).length === 0}
                 >
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Export Groups
                 </Button>
             </div>

          {loading && (
              <div className="text-center py-10">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
                  <p className="mt-2 text-gray-500">Loading group details...</p>
              </div>
          )}
          {error && (
               <div className="text-center py-10 text-red-600">
                    <AlertCircle className="mx-auto h-8 w-8"/>
                    <p className="mt-2">{error}</p>
              </div>
          )}
          {!loading && !error && Object.keys(groupedData).length === 0 && (
              <p className="text-center py-10 text-gray-500">No participants assigned to groups yet.</p>
          )}
          {!loading && !error && Object.keys(groupedData).length > 0 && (
            <Accordion type="single" collapsible className="w-full mt-4">
              {Object.entries(groupedData).map(([groupKey, participants]) => (
                <AccordionItem key={groupKey} value={groupKey}>
                  <AccordionTrigger className="text-lg font-medium hover:no-underline bg-slate-50 px-4 rounded-t-md">
                    {groupKey} ({participants.length} {participants.length === 1 ? 'participant' : 'participants'})
                  </AccordionTrigger>
                  <AccordionContent className="bg-white px-4 pt-3 pb-1 rounded-b-md border border-t-0">
                    <ul className="list-disc pl-5 space-y-1 max-h-60 overflow-y-auto">
                      {participants.map((p) => (
                        <li key={p.id} className="text-sm text-gray-700">
                          {p.full_name} ({p.age}, {p.gender}, {p.church_location})
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-xs text-gray-400">
        The Potter's House Christian Fellowship Church - Laguna District
      </footer>
    </div>
  );
}
