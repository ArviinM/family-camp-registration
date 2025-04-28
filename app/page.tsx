'use client'; // Convert to client component

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Import next/image
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from '../src/lib/supabase/client'; // Assuming default alias setup
import type { Database } from '../src/lib/supabase/database.types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Search, Download, Loader2, AlertCircle, UserCheck, UserX,
  MapPin, Flame, Users, Tent, Sparkles, Info, ScanLine, ExternalLink // Added icons
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [searchResult, setSearchResult] = useState<RegistrantRow[] | string | null>(null);
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
    setSearchResult(null); // Reset previous results
    if (!searchTerm.trim()) { // Check for empty or whitespace-only search term
        setSearchResult("Please enter a name to search.");
        setIsSearching(false);
        return;
    }
    console.log(`Searching for: ${searchTerm}`);
    // Simulate network delay for feedback
    setTimeout(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const foundRegistrants = registrants.filter(r => 
            r.full_name.toLowerCase().includes(lowerCaseSearchTerm)
        );

        if (foundRegistrants.length > 0) {
            setSearchResult(foundRegistrants); // Store the array of found registrants
        } else {
            setSearchResult(`Participant "${searchTerm}" not found.`);
        }
        setIsSearching(false);
    }, 500); // Short delay
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
    <div className="flex flex-col items-center min-h-screen p-4 lg:p-8 bg-gradient-to-br from-yellow-50 via-orange-100 to-yellow-100">
      
      {/* Main Content Card */}
      <Card className="w-full max-w-5xl shadow-lg mb-8 overflow-hidden bg-white">
        {/* Cover Image added directly inside Card, before CardContent */}
        <div className="w-full">
            <Image 
                src="/cover.png" 
                alt="Laguna District Family Camp 2025 Cover" 
                width={1600} // Example width, adjust as needed based on original image resolution
                height={600} // Example height, adjust maintaining aspect ratio
                className="w-full h-auto object-cover" // Cover the area
                priority
            />
        </div>
        
        <CardContent className="p-6 md:p-8 space-y-8">
            {/* Title and Date moved here from header */}
            <div className="text-center mb-6 -mt-2"> {/* Adjust margin as needed */}
                <h1 className="text-3xl font-bold text-blue-900 tracking-tight sm:text-4xl md:text-5xl">
                    Laguna District Family Camp 2025
                </h1>
                <p className="mt-1 text-xl text-blue-800 font-semibold">
                    May 1-2, 2025
                </p>
                 <p className="mt-4 text-2xl text-orange-600 italic"> 
                   "Growing in Faith, Growing Together"
                 </p>
                 <p className="mt-1 text-sm text-gray-600">
                   ~ 2 Peter 3:18
                 </p>
            </div>
            
            {/* Venue & Activities */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Venue */}
                <div className="rounded-lg border bg-blue-50/50 p-4 shadow-sm">
                    <h3 className="text-lg font-semibold mb-2 flex items-center text-blue-900"><MapPin className="w-5 h-5 mr-2 text-red-600"/> Venue</h3>
                    <p className="font-medium text-blue-800">Bluskye Ecofarm Resort</p>
                    <p className="text-sm text-muted-foreground">Villa Adelina, San Roque, Victoria City, Laguna</p>
                    {/* QR Code */}
                    <div className="mt-4 flex flex-col items-center space-y-2">
                         <Image 
                           src="/qr.png" // IMPORTANT: Replace with QR code path in /public
                           alt="Location Map QR Code" 
                           width={100} 
                           height={100} 
                           className="object-contain border p-1 rounded-sm bg-white" 
                         />
                        <p className="text-xs text-muted-foreground flex items-center"><ScanLine className="w-3 h-3 mr-1"/> Scan for Google Maps</p>
                        {/* Add Google Maps Link Button */}
                        <Button variant="link" size="sm" asChild className="text-xs h-auto p-0 text-blue-600 hover:text-blue-800">
                             <a href="https://maps.app.goo.gl/vTGJEHdpVSGS4Stm9" target="_blank" rel="noopener noreferrer">
                                 View on Google Maps
                                 <ExternalLink className="w-3 h-3 ml-1" />
                             </a>
                         </Button>
                    </div>
                </div>
                {/* Activities */}
                <div className="rounded-lg border bg-green-50/50 p-4 shadow-sm">
                    <h3 className="text-lg font-semibold mb-2 flex items-center text-green-900"><Sparkles className="w-5 h-5 mr-2 text-yellow-500"/> Highlights</h3>
                    <ul className="list-none space-y-1 text-sm text-green-800">
                        <li className="flex items-center"><Flame className="w-4 h-4 mr-2 text-orange-500"/> Bonfire Camping</li>
                        <li className="flex items-center"><Users className="w-4 h-4 mr-2 text-blue-500"/> Group Seminars</li>
                        <li className="flex items-center"><Tent className="w-4 h-4 mr-2 text-green-600"/> Team Building Activities</li>
                        <li className="flex items-center"><UserCheck className="w-4 h-4 mr-2 text-cyan-500"/> Water Baptism</li>
                         {/* Add more if desired */}
                    </ul>
                </div>
            </div>

            {/* Reminders */}
            <div className="rounded-lg border bg-orange-50 text-orange-900 shadow-sm p-4">
                 <h3 className="text-lg font-semibold mb-2 flex items-center text-orange-900"><Info className="w-5 h-5 mr-2"/> Important Reminders</h3>
                 <ul className="list-disc pl-5 space-y-1 text-sm">
                     <li>Shorts, crop tops, spaghetti straps, see-through, and revealing clothes are <span className="font-bold text-red-700">NOT ALLOWED</span>.</li>
                     <li><span className="font-bold">DO NOT</span> bring high wattage appliances.</li>
                     <li>No public display of affection.</li>
                     <li>Prioritize health: If feeling unwell or need rest, please feel free to skip team building activities.</li>
                 </ul>
             </div>

            {/* Divider */}
            <hr className="my-6 border-slate-200"/>

            {/* Search Section */}
            <div>
                <h3 className="text-xl font-semibold text-blue-800 text-center mb-4">Find Your Group</h3>
                <div className="flex w-full max-w-sm items-center space-x-2 mx-auto">
                    <Input
                        type="text"
                        placeholder="Enter participant's name..."
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
                {/* Display Search Results */}
                {searchResult && (
                    <div className="mt-4 max-w-sm mx-auto">
                        {typeof searchResult === 'string' ? (
                            // Display messages (e.g., "not found", "please enter")
                            <div className={`text-center text-sm p-2 rounded-md ${searchResult.includes('not found') || searchResult.includes('Please enter') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {searchResult.includes('not found') || searchResult.includes('Please enter') ? <UserX className="inline h-4 w-4 mr-1"/> : <Info className="inline h-4 w-4 mr-1"/>}
                                {searchResult}
                            </div>
                        ) : (
                            // Display list of found participants
                            <div className="border rounded-md bg-green-50 shadow-sm">
                                <p className="text-sm font-medium text-green-800 p-2 border-b bg-green-100 rounded-t-md flex items-center">
                                    <UserCheck className="inline h-4 w-4 mr-2 text-green-700"/> Found {searchResult.length} participant(s):
                                </p>
                                <ul className="divide-y divide-green-100 text-sm p-2 max-h-40 overflow-y-auto">
                                    {searchResult.map(registrant => (
                                        <li key={registrant.id} className="py-1.5 px-1 text-gray-800">
                                            <span className="font-medium">{registrant.full_name}</span> - {registrant.assigned_group === null ? 'Unassigned' : `Group ${registrant.assigned_group}`}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Group Display Section */}
            <div className="mt-8">
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-blue-800">Camp Group Assignments</h3>
                    {/* Export Button - Only shown if data loaded? */} 
                    {!loading && !error && Object.keys(groupedData).length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGroupExport}
                            disabled={isExporting}
                        >
                            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Export Groups
                        </Button>
                    )}
                </div>

                {loading && (
                    <div className="text-center py-10 text-gray-500">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                        <p className="mt-2">Loading group details...</p>
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
                    <Accordion type="single" collapsible className="w-full">
                        {Object.entries(groupedData).map(([groupKey, participants]) => (
                            <AccordionItem key={groupKey} value={groupKey} className="border-b-0 mb-1">
                                <AccordionTrigger className="text-lg font-medium hover:no-underline bg-yellow-100 hover:bg-yellow-200/80 px-4 py-3 rounded-md data-[state=open]:rounded-b-none">
                                    {groupKey} ({participants.length} {participants.length === 1 ? 'participant' : 'participants'})
                                </AccordionTrigger>
                                <AccordionContent className="bg-white px-4 pt-3 pb-2 rounded-b-md border border-t-0 border-yellow-200 shadow-sm">
                                    <ul className="list-disc pl-5 space-y-1 max-h-60 overflow-y-auto text-sm text-gray-800">
                                        {participants.map((p) => (
                                            <li key={p.id}>
                                                {p.full_name} <span className="text-xs text-muted-foreground">({p.age}, {p.gender}, {p.church_location})</span>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>
        </CardContent>
      </Card>

      <footer className="mt-4 text-center text-xs text-gray-600">
        The Potter's House Christian Fellowship Church - Laguna District
      </footer>
    </div>
  );
}
