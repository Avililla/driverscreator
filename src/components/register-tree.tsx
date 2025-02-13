"use client";

import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
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

type Register = {
  id: string;
  name: string;
  description: string;
  sections: RegisterSection[];
};

type RegisterItemProps = {
  register: Register;
  index: number;
  moveRegister: (dragIndex: number, hoverIndex: number) => void;
  updateRegister: (updatedRegister: Register) => void;
  deleteRegister: (registerId: string) => void;
};

const RegisterItem = ({
  register,
  index,
  moveRegister,
  updateRegister,
  deleteRegister,
}: RegisterItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRegister, setEditedRegister] = useState(register);

  const [, drag] = useDrag({
    type: "REGISTER",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "REGISTER",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveRegister(item.index, index);
        item.index = index;
      }
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    updateRegister(editedRegister);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedRegister(register);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteRegister(register.id);
  };

  const renderSections = () => {
    return editedRegister.sections.map((section, sectionIndex) => (
      <div key={sectionIndex} className="ml-4 mt-2">
        {"name" in section ? (
          <div>
            <Input
              value={section.name}
              onChange={(e) => {
                const newSections = [...editedRegister.sections];
                (newSections[sectionIndex] as Partition).name = e.target.value;
                setEditedRegister({ ...editedRegister, sections: newSections });
              }}
              placeholder="Section name"
              disabled={!isEditing}
            />
            <Input
              type="number"
              value={section.bits}
              onChange={(e) => {
                const newSections = [...editedRegister.sections];
                newSections[sectionIndex].bits = Number.parseInt(
                  e.target.value,
                  10
                );
                setEditedRegister({ ...editedRegister, sections: newSections });
              }}
              placeholder="Bits"
              disabled={!isEditing}
            />
            <Select
              value={section.access}
              onValueChange={(value: "read" | "write" | "read-write") => {
                const newSections = [...editedRegister.sections];
                (newSections[sectionIndex] as Partition).access = value;
                setEditedRegister({ ...editedRegister, sections: newSections });
              }}
              disabled={!isEditing}
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
              value={section.description}
              onChange={(e) => {
                const newSections = [...editedRegister.sections];
                (newSections[sectionIndex] as Partition).description =
                  e.target.value;
                setEditedRegister({ ...editedRegister, sections: newSections });
              }}
              placeholder="Partition description"
              disabled={!isEditing}
            />
          </div>
        ) : (
          <div>
            <Label>Spare Bits</Label>
            <Input
              type="number"
              value={section.bits}
              onChange={(e) => {
                const newSections = [...editedRegister.sections];
                newSections[sectionIndex].bits = Number.parseInt(
                  e.target.value,
                  10
                );
                setEditedRegister({ ...editedRegister, sections: newSections });
              }}
              placeholder="Bits"
              disabled={!isEditing}
            />
          </div>
        )}
      </div>
    ));
  };

  return (
    <div
      ref={(node) => {
        drag(node);
        drop(node);
      }}
      className="border p-4 mb-4"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {isEditing ? (
            <Input
              value={editedRegister.name}
              onChange={(e) =>
                setEditedRegister({ ...editedRegister, name: e.target.value })
              }
              placeholder="Register name"
            />
          ) : (
            register.name
          )}
        </h3>
        <div>
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="mr-2">
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleEdit} className="mr-2">
                Edit
              </Button>
              <Button onClick={handleDelete} variant="destructive">
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="mt-2">
        <Label>Description</Label>
        {isEditing ? (
          <Textarea
            value={editedRegister.description}
            onChange={(e) =>
              setEditedRegister({
                ...editedRegister,
                description: e.target.value,
              })
            }
            placeholder="Register description"
          />
        ) : (
          <p>{register.description}</p>
        )}
      </div>
      {renderSections()}
    </div>
  );
};

type RegisterTreeProps = {
  registers: Register[];
  onMoveRegister: (dragIndex: number, hoverIndex: number) => void;
  onUpdateRegister: (updatedRegister: Register) => void;
  onDeleteRegister: (registerId: string) => void;
};

const RegisterTree = ({
  registers,
  onMoveRegister,
  onUpdateRegister,
  onDeleteRegister,
}: RegisterTreeProps) => {
  return (
    <div>
      {registers.map((register, index) => (
        <RegisterItem
          key={register.id}
          register={register}
          index={index}
          moveRegister={onMoveRegister}
          updateRegister={onUpdateRegister}
          deleteRegister={onDeleteRegister}
        />
      ))}
    </div>
  );
};

export default RegisterTree;
