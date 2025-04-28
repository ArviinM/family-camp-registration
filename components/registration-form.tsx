'use client';

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner"; // For displaying messages
import { supabase } from '../src/lib/supabase/client'; // Corrected path
import { CHURCH_LOCATIONS, ChurchLocation } from '../src/lib/constants'; // Corrected path and import type
import type { Database } from '../src/lib/supabase/database.types'; // Corrected path

// Define the Zod schema for validation
const formSchema = z.object({
  full_name: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  age: z.coerce // Use coerce to convert input string to number
    .number({
      required_error: "Age is required.",
      invalid_type_error: "Age must be a number.",
    })
    .int()
    .gte(12, { message: "Must be 12 or older to register." }),
  church_location: z.enum(CHURCH_LOCATIONS, {
    required_error: "Please select a church location.",
  }),
  // Make gender required using enum
  gender: z.enum(["Male", "Female"], {
    required_error: "Please select a gender.",
  }),
  // Optional: Add gender if needed later
  // gender: z.string().optional(),
});

// Infer the TypeScript type from the Zod schema
export type RegistrationFormValues = z.infer<typeof formSchema>;

// Define the props for the component, including the submission handler
interface RegistrationFormProps {
  onSubmitSuccess?: () => void; // Optional callback on success
}

export function RegistrationForm({ onSubmitSuccess }: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // 1. Define your form.
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      age: '' as any, // Change undefined to empty string for controlled input
      church_location: undefined,
      gender: undefined, // Add default value for gender
      // gender: undefined,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: RegistrationFormValues) {
    setIsSubmitting(true);
    console.log("Form submitted:", values);

    // Map form values to Supabase insert type
    // Note: Zod schema keys match Supabase column names here
    type NewRegistrant = Database['public']['Tables']['registrants']['Insert'];
    const registrantData: NewRegistrant = {
        ...values,
        gender: values.gender || null,
        assigned_group: null // Explicitly set null if not provided
    };

    try {
      const { error } = await supabase
        .from('registrants')
        .insert(registrantData);

      if (error) {
        console.error('Supabase insertion error:', error);
        toast.error(`Registration failed: ${error.message}`);
      } else {
        toast.success("Registration successful!");
        form.reset(); // Reset form fields
        onSubmitSuccess?.(); // Call success callback if provided
        // Potentially trigger grouping logic here if needed (Task 3.4 Option A)
      }
    } catch (err) {
      console.error("Unexpected error during submission:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Full Name Field */}
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Age Field */}
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter age" {...field} onChange={event => field.onChange(+event.target.value)} />
              </FormControl>
              <FormDescription>
                Participants must be 12 years or older.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gender Field */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Male" />
                    </FormControl>
                    <FormLabel className="font-normal">Male</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Female" />
                    </FormControl>
                    <FormLabel className="font-normal">Female</FormLabel>
                  </FormItem>
                  {/* Optional: Add Prefer not to say or other options */}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Church Location Field */}
        <FormField
          control={form.control}
          name="church_location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Church Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your church location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CHURCH_LOCATIONS.map((location: ChurchLocation) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </Form>
  );
} 