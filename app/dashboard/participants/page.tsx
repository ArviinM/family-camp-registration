'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../src/lib/supabase/client'; // Corrected relative path
import type { Database } from '../../../src/lib/supabase/database.types'; // Corrected relative path
import { ParticipantTable } from '@/components/participant-table'; // Import reusable component
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // For action buttons
import { Download, Upload, Users, FileSpreadsheet } from 'lucide-react'; // Icons for buttons and FileSpreadsheet
import ExcelJS from 'exceljs'; // Import exceljs
import { saveAs } from 'file-saver'; // Import file-saver

// Define the type for a registrant row we expect to fetch
type RegistrantRow = Database['public']['Tables']['registrants']['Row'];

export default function ManageParticipantsPage() {
  const [registrants, setRegistrants] = useState<RegistrantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false); // State for export button

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (registrants.length === 0 && !loading) {
          alert("No participant data to export.");
          return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Camp Registration System';
      workbook.created = new Date();
      workbook.modified = new Date();

      const headers = [
          { header: 'Full Name', key: 'full_name', width: 30 },
          { header: 'Age', key: 'age', width: 10 },
          { header: 'Gender', key: 'gender', width: 15 },
          { header: 'Location', key: 'church_location', width: 25 },
          { header: 'Assigned Group', key: 'assigned_group', width: 15 }
      ];

      // --- All Participants Sheet ---
      const allSheet = workbook.addWorksheet('All Participants');
      // 1. Define column structure (keys, widths) - headers might go to Row 1 initially
      allSheet.columns = headers;
      // 2. Add Title Row (merged, styled) - explicitly sets Row 1 content
      allSheet.mergeCells('A1:E1');
      const titleCellAll = allSheet.getCell('A1');
      titleCellAll.value = 'Laguna District Family Camp - All Participants (Age 12+)';
      titleCellAll.font = { name: 'Calibri', size: 16, bold: true };
      titleCellAll.alignment = { vertical: 'middle', horizontal: 'center' };
      // 3. Add empty row (becomes Row 2)
      allSheet.addRow([]);
      // 4. Add actual Header text row (becomes Row 3)
      const headerRowAll = allSheet.addRow(headers.map(h => h.header));
      headerRowAll.font = { bold: true }; // Make this specific row bold
      // 5. Add data rows (starting from Row 4)
      registrants.forEach(reg => {
          allSheet.addRow({
              ...reg,
              assigned_group: reg.assigned_group ?? 'None'
          });
      });

      // --- Group Sheets ---
      const groups = [1, 2, 3, 4, 5];
      groups.forEach(groupNum => {
        const groupRegistrants = registrants.filter(reg => reg.assigned_group === groupNum);
        if (groupRegistrants.length === 0) return; // Skip empty groups

        const sheetName = `Group ${groupNum}`;
        const sheet = workbook.addWorksheet(sheetName);
        const groupHeaders = headers.filter(h => h.key !== 'assigned_group');

        // 1. Define column structure
        sheet.columns = groupHeaders;
        // 2. Add Title Row
        sheet.mergeCells('A1:D1');
        const titleCellGroup = sheet.getCell('A1');
        titleCellGroup.value = `Laguna District Family Camp - ${sheetName} Participants`;
        titleCellGroup.font = { name: 'Calibri', size: 16, bold: true };
        titleCellGroup.alignment = { vertical: 'middle', horizontal: 'center' };
        // 3. Add empty row
        sheet.addRow([]);
        // 4. Add actual Header text row
        const headerRowGroup = sheet.addRow(groupHeaders.map(h => h.header));
        headerRowGroup.font = { bold: true };
        // 5. Add data rows
        groupRegistrants.forEach(reg => {
          sheet.addRow(reg); // Note: Still might trigger linter warning
        });
      });

      // --- Unassigned Sheet ---
      const unassignedRegistrants = registrants.filter(reg => reg.assigned_group === null);
      if (unassignedRegistrants.length > 0) {
          const unassignedSheet = workbook.addWorksheet('Unassigned');
          const unassignedHeaders = headers.filter(h => h.key !== 'assigned_group');

          // 1. Define column structure
          unassignedSheet.columns = unassignedHeaders;
          // 2. Add Title Row
          unassignedSheet.mergeCells('A1:D1');
          const titleCellUnassigned = unassignedSheet.getCell('A1');
          titleCellUnassigned.value = 'Laguna District Family Camp - Unassigned Participants (Age 12+)';
          titleCellUnassigned.font = { name: 'Calibri', size: 16, bold: true };
          titleCellUnassigned.alignment = { vertical: 'middle', horizontal: 'center' };
          // 3. Add empty row
          unassignedSheet.addRow([]);
          // 4. Add actual Header text row
          const headerRowUnassigned = unassignedSheet.addRow(unassignedHeaders.map(h => h.header));
          headerRowUnassigned.font = { bold: true };
          // 5. Add data rows
          unassignedRegistrants.forEach(reg => {
              unassignedSheet.addRow(reg); // Note: Still might trigger linter warning
          });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const date = new Date().toISOString().split('T')[0];
      saveAs(blob, `family-camp-export-${date}.xlsx`);

    } catch (exportError) {
      console.error("Export Error:", exportError);
      alert("An error occurred during export. Please check the console.");
    } finally {
      setIsExporting(false);
    }
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
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={isExporting || loading}
                >
                    {isExporting ? (
                       <FileSpreadsheet className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                       <Download className="mr-2 h-4 w-4" />
                    )}
                    {isExporting ? 'Exporting...' : 'Export'}
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