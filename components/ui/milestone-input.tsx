"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface Milestone {
  title: string
  amount: number
}

export interface MilestoneInputProps {
  value: Milestone[]
  onChange: (value: Milestone[]) => void
  className?: string
}

const MilestoneInput = React.forwardRef<HTMLDivElement, MilestoneInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const handleAddMilestone = () => {
      onChange([...value, { title: "", amount: 0 }])
    }

    const handleRemoveMilestone = (index: number) => {
      const newMilestones = [...value]
      newMilestones.splice(index, 1)
      onChange(newMilestones)
    }

    const handleMilestoneChange = (
      index: number,
      field: keyof Milestone,
      fieldValue: string | number
    ) => {
      const newMilestones = [...value]
      newMilestones[index] = {
        ...newMilestones[index],
        [field]: field === "amount" ? Number(fieldValue) : fieldValue,
      }
      onChange(newMilestones)
    }

    return (
      <div ref={ref} className={cn("space-y-3", className)} {...props}>
        {value.map((milestone, index) => (
          <div key={index} className="flex items-center gap-3">
            <Input
              placeholder="Milestone title"
              value={milestone.title}
              onChange={(e) =>
                handleMilestoneChange(index, "title", e.target.value)
              }
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Amount"
              value={milestone.amount || ""}
              onChange={(e) =>
                handleMilestoneChange(index, "amount", e.target.value)
              }
              className="w-32"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveMilestone(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={handleAddMilestone}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Milestone
        </Button>
      </div>
    )
  }
)
MilestoneInput.displayName = "MilestoneInput"

export { MilestoneInput } 