"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import StaffFitnessManager from "@/components/fitness/StaffFitnessManager";

export default function FitnessPage() {
  const [activeTab, setActiveTab] = useState("OVERVIEW");

  return (
    <div>
      <StaffFitnessManager userRole="ADMIN" />
    </div>
  );
}