"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type RegisterFormProps = {
  onAddRegister: (register: {
    name: string;
    description: string;
    sections: RegisterSection[];
  }) => boolean;
  bitWidth: "32" | "64";
};

export default function RegisterForm({
  onAddRegister,
  bitWidth,
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState<RegisterSection[]>([]);
  const [partitionName, setPartitionName] = useState("");
  const [partitionBits, setPartitionBits] = useState("");
  const [partitionAccess, setPartitionAccess] = useState<
    "read" | "write" | "read-write"
  >("read-write");
  const [spareBits, setSpareBits] = useState("");
  const [partitionDescription, setPartitionDescription] = useState("");

  const handleAddPartition = () => {
    if (partitionName && partitionBits) {
      const newPartition: Partition = {
        name: partitionName,
        bits: Number.parseInt(partitionBits, 10),
        access: partitionAccess,
        description: partitionDescription,
      };
      setSections([...sections, newPartition]);
      setPartitionName("");
      setPartitionBits("");
      setPartitionAccess("read-write");
      setPartitionDescription("");
    }
  };

  const handleAddSpareBits = () => {
    if (spareBits) {
      const newSpareBits: SpareBits = { bits: Number.parseInt(spareBits, 10) };
      setSections([...sections, newSpareBits]);
      setSpareBits("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && description && sections.length > 0) {
      const wasAdded = onAddRegister({ name, description, sections });
      if (wasAdded) {
        setName("");
        setDescription("");
        setSections([]);
      }
    }
  };

  const totalBits = sections.reduce((sum, section) => sum + section.bits, 0);
  const maxBits = bitWidth === "32" ? 32 : 64;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="registerName">Register Name</Label>
        <Input
          id="registerName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter register name"
          required
        />
      </div>
      <div>
        <Label htmlFor="registerDescription">Register Description</Label>
        <Textarea
          id="registerDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter register description"
          required
        />
      </div>
      <div>
        <Label>Partitions</Label>
        <div className="flex space-x-2">
          <Input
            value={partitionName}
            onChange={(e) => setPartitionName(e.target.value)}
            placeholder="Partition name"
          />
          <Input
            type="number"
            value={partitionBits}
            onChange={(e) => setPartitionBits(e.target.value)}
            placeholder="Bits"
            min="1"
            max={(maxBits - totalBits).toString()}
          />
          <Select
            value={partitionAccess}
            onValueChange={(value: "read" | "write" | "read-write") =>
              setPartitionAccess(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Access" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="write">Write</SelectItem>
              <SelectItem value="read-write">Read-Write</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={partitionDescription}
            onChange={(e) => setPartitionDescription(e.target.value)}
            placeholder="Partition description"
          />
          <Button
            type="button"
            onClick={handleAddPartition}
            disabled={totalBits >= maxBits}
          >
            Add Partition
          </Button>
        </div>
      </div>
      <div>
        <Label>Spare Bits</Label>
        <div className="flex space-x-2">
          <Input
            type="number"
            value={spareBits}
            onChange={(e) => setSpareBits(e.target.value)}
            placeholder="Spare bits"
            min="1"
            max={(maxBits - totalBits).toString()}
          />
          <Button
            type="button"
            onClick={handleAddSpareBits}
            disabled={totalBits >= maxBits}
          >
            Add Spare Bits
          </Button>
        </div>
      </div>
      <div>
        <h4>Current Sections:</h4>
        <ul>
          {sections.map((section, index) => (
            <li key={index}>
              {"name" in section
                ? `${section.name}: ${section.bits} bits, ${section.access}, ${section.description}`
                : `Spare bits: ${section.bits} bits`}
            </li>
          ))}
        </ul>
        <p>
          Total bits: {totalBits}/{maxBits}
        </p>
      </div>
      <Button type="submit" disabled={totalBits !== maxBits}>
        Add Register
      </Button>
    </form>
  );
}
