import ExcelJS from 'exceljs';
import { toast } from 'sonner';
import { supabase } from '../supabase/client'; // Correct path to Supabase client
import { CHURCH_LOCATIONS } from '../constants'; // Correct path to constants
import type { Database } from '../supabase/database.types'; // Correct path to types

// Type for the data we expect to insert/upsert (subset of RegistrantRow)
type RegistrantInsert = Database['public']['Tables']['registrants']['Insert'];

// Define a type for the result of the import process
export interface ImportResult {
  success: boolean;
  message: string;
  processedRows: number;
  insertedCount: number; // Or successful upsert count
  skippedCount: number;
  errors: string[];
}

/**
 * Reads an Excel file, validates registrant data, and upserts valid entries to Supabase.
 * @param file The Excel file object to process.
 * @returns An ImportResult object summarizing the process.
 */
export const processRegistrantImport = async (file: File): Promise<ImportResult> => {
  const result: ImportResult = {
    success: false,
    message: 'Import process started.',
    processedRows: 0,
    insertedCount: 0,
    skippedCount: 0,
    errors: [],
  };

  console.log("Processing file:", file.name);
  toast.info("Starting import process...");

  try {
    // --- Implement Task 5.4 & 5.5 ---
    // 1. Read the file using ExcelJS
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0]; // Assume data is on the first sheet
    if (!worksheet) {
        throw new Error("Could not find worksheet in the uploaded file.");
    }

    const validRegistrants: RegistrantInsert[] = [];
    let rowCount = 0;

    // Iterate over all rows that have values (starts from 1)
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        rowCount++;
        // Skip header row (assuming it's row 1)
        if (rowNumber === 1) return;

        result.processedRows++;

        // --- Data Extraction (using header keys defined in template) ---
        // Ensure robust access, handling potential missing cells/values
        const fullName = row.getCell('full_name').value?.toString().trim() || '';
        const ageValue = row.getCell('age').value;
        const gender = row.getCell('gender').value?.toString().trim() || '';
        const location = row.getCell('church_location').value?.toString().trim() || '';

        // --- Validation ---
        let isValid = true;
        const rowErrors: string[] = [];

        // Validate Full Name
        if (!fullName) {
            isValid = false;
            rowErrors.push('Full Name is missing');
        }

        // Validate Age
        let age: number | null = null;
        if (ageValue === null || ageValue === undefined || ageValue === '') {
            isValid = false;
            rowErrors.push('Age is missing');
        } else {
            age = Number(ageValue);
            if (isNaN(age) || !Number.isInteger(age)) {
                isValid = false;
                rowErrors.push(`Invalid age format: "${ageValue}"`);
            } else if (age < 12) {
                isValid = false;
                rowErrors.push(`Age must be 12 or older, found: ${age}`);
            }
        }

        // Validate Gender
        const validGenders = ['Male', 'Female'];
        if (!gender) {
            isValid = false;
            rowErrors.push('Gender is missing');
        } else if (!validGenders.some(g => g.toLowerCase() === gender.toLowerCase())) {
            isValid = false;
            rowErrors.push(`Invalid gender: "${gender}". Must be Male or Female.`);
        }

        // Validate Location
        if (!location) {
            isValid = false;
            rowErrors.push('Location is missing');
        } else if (!CHURCH_LOCATIONS.includes(location as any)) { // Type assertion needed if CHURCH_LOCATIONS is readonly
            isValid = false;
            rowErrors.push(`Invalid location: "${location}". Must match allowed values.`);
        }

        // --- Collect Valid Data ---
        if (isValid && age !== null) {
            validRegistrants.push({
                full_name: fullName,
                age: age, // Use the validated number
                gender: validGenders.find(g => g.toLowerCase() === gender.toLowerCase()) || null, // Standardize case
                church_location: location as any, // Use the validated location
                // assigned_group will be null by default in DB or handled by trigger/RPC
            });
        } else {
            result.skippedCount++;
            result.errors.push(`Row ${rowNumber}: ${rowErrors.join(', ')}`);
        }
    });

    if (rowCount <= 1) { // Only header row or empty file
        throw new Error("No data rows found in the file.");
    }

    // --- 5. Call Supabase Upsert ---
    if (validRegistrants.length > 0) {
        toast.info(`Attempting to upsert ${validRegistrants.length} valid registrants...`);
        const { count, error: upsertError } = await supabase
            .from('registrants')
            .upsert(validRegistrants, {
                onConflict: 'full_name', // Assuming full_name should be unique? Or another constraint?
                // Adjust onConflict based on your actual unique constraints if any.
                ignoreDuplicates: false, 
                count: 'exact' // Get the count of affected rows here
            });

        if (upsertError) {
            console.error("Supabase upsert error:", upsertError);
            throw new Error(`Database error during upsert: ${upsertError.message}`);
        }

        result.insertedCount = count ?? 0; // `count` reflects rows inserted/updated by upsert
        result.success = true;
        result.message = `Import finished. Processed: ${result.processedRows}, Upserted/Updated: ${result.insertedCount}, Skipped: ${result.skippedCount}.`;

        // --- 7. Optional: Trigger Group Assignment for new imports ---
        // This is complex with upsert. A safer approach is manual trigger after import.
        // console.log("Group assignment for imported users needs to be triggered manually or via a separate process.");
        toast.info("Remember to manually assign groups if needed for newly imported participants.");

    } else {
        // No valid registrants found, but processing might have occurred
        if (result.errors.length > 0) {
             result.message = `Import completed with validation errors. Processed: ${result.processedRows}, Skipped: ${result.skippedCount}. See errors for details.`;
        } else {
             result.message = "Import file processed, but no valid registrant data found to import.";
        }
        // Keep success as false if nothing was upserted
    }

  } catch (error: any) {
    console.error("Error during import processing:", error);
    result.success = false;
    result.message = `Import failed: ${error.message}`;
    result.errors.push(error.message);
    toast.error(`Import failed: ${error.message}`); // Also show toast error
  }

  // Provide detailed feedback
  if (result.success) {
      toast.success(result.message);
  } else {
      // Errors might already be in toast from the catch block
      if (result.skippedCount > 0) {
           toast.warning(`Skipped ${result.skippedCount} rows due to validation errors. Check console or error details if available.`);
      }
  }
  // Log detailed errors if any
  if (result.errors.length > 0) {
      console.warn("Import validation errors:", result.errors);
  }

  return result;
};
