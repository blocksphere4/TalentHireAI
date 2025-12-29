"use server";

import { createClient } from "@supabase/supabase-js";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

export async function uploadResume(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const applicationId = formData.get("applicationId") as string;

    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return {
        success: false,
        error: "Invalid file type. Only PDF files are allowed.",
      };
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File size exceeds 10MB limit.",
      };
    }

    // Extract text from PDF
    let extractedText = "";
    try {
      const loader = new PDFLoader(file);
      const docs = await loader.load();
      extractedText = docs.map((doc) => doc.pageContent).join("\n");
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      // Continue with upload even if text extraction fails
    }

    // Create Supabase client with service role for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const timestamp = Date.now();
    const fileName = `${applicationId || "temp"}/${timestamp}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading to Supabase:", uploadError);
      return {
        success: false,
        error: "Failed to upload file to storage.",
      };
    }

    // Get signed URL (valid for 1 year)
    const { data: urlData, error: urlError } = await supabase.storage
      .from("resumes")
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

    if (urlError || !urlData) {
      console.error("Error generating signed URL:", urlError);
      return {
        success: false,
        error: "Failed to generate file URL.",
      };
    }

    return {
      success: true,
      url: urlData.signedUrl,
      path: fileName,
      text: extractedText,
    };
  } catch (error) {
    console.error("Error in uploadResume:", error);
    return {
      success: false,
      error: "An unexpected error occurred during upload.",
    };
  }
}

export async function deleteResume(filePath: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { error } = await supabase.storage.from("resumes").remove([filePath]);

    if (error) {
      console.error("Error deleting resume:", error);
      return {
        success: false,
        error: "Failed to delete file.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in deleteResume:", error);
    return {
      success: false,
      error: "An unexpected error occurred during deletion.",
    };
  }
}
