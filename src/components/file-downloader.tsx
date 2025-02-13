"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  generateCFile,
  generateHFile,
  generateLatexPDF,
} from "@/lib/file-generators";
import { jsPDF } from "jspdf";

type Register = {
  id: string;
  name: string;
  description: string;
  sections: Array<{
    name?: string;
    bits: number;
    access?: "read" | "write" | "read-write";
    description?: string;
  }>;
};

type FileDownloaderProps = {
  deviceName: string;
  deviceDescription: string;
  baseAddress: string;
  bitWidth: "32" | "64";
  registers: Register[];
};

const FileDownloader: React.FC<FileDownloaderProps> = ({
  deviceName,
  deviceDescription,
  baseAddress,
  bitWidth,
  registers,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAndDownloadFiles = async () => {
    setIsGenerating(true);

    try {
      // Generate C file
      const cContent = generateCFile(
        deviceName,
        baseAddress,
        bitWidth,
        registers
      );
      downloadFile(
        `${deviceName.toLowerCase()}_registers.c`,
        cContent,
        "text/plain"
      );

      // Generate H file
      const hContent = generateHFile(
        deviceName,
        baseAddress,
        bitWidth,
        registers
      );
      downloadFile(
        `${deviceName.toLowerCase()}_registers.h`,
        hContent,
        "text/plain"
      );

      // Generate LaTeX file
      const texContent = generateLatexPDF(
        deviceName,
        deviceDescription,
        baseAddress,
        bitWidth,
        registers
      );
      downloadFile(
        `${deviceName.toLowerCase()}_registers.tex`,
        texContent,
        "application/x-latex"
      );

      // Generate PDF from LaTeX
      const pdf = new jsPDF();
      pdf.text(texContent, 10, 10);
      pdf.save(`${deviceName.toLowerCase()}_registers.pdf`);
    } catch (error) {
      console.error("Error generating files:", error);
      alert("An error occurred while generating the files. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFile = (
    filename: string,
    content: string,
    contentType: string
  ) => {
    const blob = new Blob([content], { type: contentType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Button onClick={generateAndDownloadFiles} disabled={isGenerating}>
      {isGenerating ? "Generating..." : "Download Files"}
    </Button>
  );
};

export default FileDownloader;
