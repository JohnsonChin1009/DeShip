"use client"

import * as React from "react"
import { UploadCloud } from "lucide-react"

import { cn } from "@/lib/utils"

export interface FileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, icon, ...props }, ref) => {
    const [fileName, setFileName] = React.useState<string | null>(null)
    // const inputRef = React.useRef<HTMLInputElement>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setFileName(e.target.files[0].name)
      } else {
        setFileName(null)
      }

      if (props.onChange) {
        props.onChange(e)
      }
    }

    return (
      <div className="relative">
        <label
          className={cn(
            "flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-input bg-background px-3 py-4 text-sm ring-offset-background hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
        >
          {icon || <UploadCloud className="mb-2 h-6 w-6 text-muted-foreground" />}
          <div className="space-y-1 text-center">
            <p className="text-sm font-medium">
              {fileName ? fileName : "Upload a file"}
            </p>
            <p className="text-xs text-muted-foreground">
              Click to browse or drag and drop
            </p>
          </div>
          <input
            ref={ref}
            type="file"
            className="sr-only"
            onChange={handleChange}
            {...props}
          />
        </label>
      </div>
    )
  }
)
FileInput.displayName = "FileInput"

export { FileInput } 