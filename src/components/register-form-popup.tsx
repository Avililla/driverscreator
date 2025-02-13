"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RegisterForm from "./register-form";

type RegisterFormPopupProps = {
  onAddRegister: (register: {
    name: string;
    description: string;
    sections: any[];
  }) => boolean;
  bitWidth: "32" | "64";
};

export default function RegisterFormPopup({
  onAddRegister,
  bitWidth,
}: RegisterFormPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddRegister = (register: {
    name: string;
    description: string;
    sections: any[];
  }) => {
    const result = onAddRegister(register);
    setIsOpen(false);
    return result;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Register</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Add New Register</DialogTitle>
        </DialogHeader>
        <RegisterForm onAddRegister={handleAddRegister} bitWidth={bitWidth} />
      </DialogContent>
    </Dialog>
  );
}
