"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import RegisterFormPopup from "./register-form-popup";
import {
  generateCFile,
  generateHFile,
  generateLatexPDF,
} from "@/lib/file-generators";

type Partition = {
  name: string;
  bits: number;
  access: "read" | "write" | "read-write";
  description: string;
};

type SpareBits = {
  bits: number;
};

type RegisterSection = Partition | SpareBits;

type Register = {
  id: string;
  name: string;
  description: string;
  sections: RegisterSection[];
};

export default function RegisterGenerator() {
  const [deviceName, setDeviceName] = useState("");
  const [deviceDescription, setDeviceDescription] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [bitWidth, setBitWidth] = useState<"32" | "64">("32");
  const [registers, setRegisters] = useState<Register[]>([]);
  const handleAddRegister = (register: Omit<Register, "id">): boolean => {
    const newRegister = { ...register, id: Date.now().toString() };
    setRegisters([...registers, newRegister]);
    return true;
  };

  const handleDeleteRegister = (registerId: string) => {
    setRegisters(registers.filter((reg) => reg.id !== registerId));
  };

  const handleMoveRegister = (registerId: string, direction: "up" | "down") => {
    const index = registers.findIndex((reg) => reg.id === registerId);
    if (
      (direction === "up" && index > 0) ||
      (direction === "down" && index < registers.length - 1)
    ) {
      const newRegisters = [...registers];
      const [movedRegister] = newRegisters.splice(index, 1);
      newRegisters.splice(
        direction === "up" ? index - 1 : index + 1,
        0,
        movedRegister
      );
      setRegisters(newRegisters);
    }
  };

  const handleGenerateFiles = () => {
    const cFileContent = generateCFile(
      deviceName,
      baseAddress,
      bitWidth,
      registers
    );
    const hFileContent = generateHFile(
      deviceName,
      baseAddress,
      bitWidth,
      registers
    );
    const latexContent = generateLatexPDF(
      deviceName,
      deviceDescription,
      baseAddress,
      bitWidth,
      registers
    );

    // Create and download C file
    const cBlob = new Blob([cFileContent], { type: "text/plain" });
    const cLink = document.createElement("a");
    cLink.href = URL.createObjectURL(cBlob);
    cLink.download = `${deviceName.toLowerCase()}_registers.c`;
    cLink.click();

    // Create and download H file
    const hBlob = new Blob([hFileContent], { type: "text/plain" });
    const hLink = document.createElement("a");
    hLink.href = URL.createObjectURL(hBlob);
    hLink.download = `${deviceName.toLowerCase()}_registers.h`;
    hLink.click();

    // Create and download LaTeX file
    const latexBlob = new Blob([latexContent], { type: "application/x-latex" });
    const latexLink = document.createElement("a");
    latexLink.href = URL.createObjectURL(latexBlob);
    latexLink.download = `${deviceName.toLowerCase()}_registers.tex`;
    latexLink.click();
  };

  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>MISRA-C Compliant Register Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                  id="deviceName"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Enter device name"
                />
              </div>
              <div>
                <Label htmlFor="deviceDescription">Device Description</Label>
                <Textarea
                  id="deviceDescription"
                  value={deviceDescription}
                  onChange={(e) => setDeviceDescription(e.target.value)}
                  placeholder="Enter device description"
                />
              </div>
              <div>
                <Label htmlFor="baseAddress">Base Address</Label>
                <Input
                  id="baseAddress"
                  value={baseAddress}
                  onChange={(e) => setBaseAddress(e.target.value)}
                  placeholder="Enter base address (e.g., 0x40000000)"
                />
              </div>
              <div>
                <Label>Bit Width</Label>
                <RadioGroup
                  value={bitWidth}
                  onValueChange={(value: "32" | "64") => setBitWidth(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="32" id="32bit" />
                    <Label htmlFor="32bit">32-bit</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="64" id="64bit" />
                    <Label htmlFor="64bit">64-bit</Label>
                  </div>
                </RadioGroup>
              </div>
              <RegisterFormPopup
                onAddRegister={handleAddRegister}
                bitWidth={bitWidth}
              />
              <Button
                onClick={handleGenerateFiles}
                disabled={registers.length === 0}
              >
                Generate MISRA-C Compliant Files and LaTeX PDF
              </Button>
            </div>
            <div className="border rounded-lg p-4 max-h-[600px] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Registers</h3>
              {registers.map((register, index) => (
                <div key={register.id} className="mb-4 p-4 border rounded-lg">
                  <h4 className="font-semibold">{register.name}</h4>
                  <p>{register.description}</p>
                  <div className="mt-2 space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleMoveRegister(register.id, "up")}
                      disabled={index === 0}
                    >
                      Move Up
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleMoveRegister(register.id, "down")}
                      disabled={index === registers.length - 1}
                    >
                      Move Down
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteRegister(register.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
