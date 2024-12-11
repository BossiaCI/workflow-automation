import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search } from 'lucide-react'

interface PdfFieldLibraryProps {
  fields: Array<{
    id: string
    label: string
    type: string
  }>
  onFieldSelect: (field: any) => void
}

export function PdfFieldLibrary({ fields, onFieldSelect }: PdfFieldLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFields = fields.filter(field =>
    field.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search fields..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <ScrollArea className="h-[400px]">
        <div className="grid gap-2">
          {filteredFields.map((field) => (
            <Button
              key={field.id}
              variant="outline"
              className="justify-start"
              onClick={() => onFieldSelect(field)}
            >
              <div className="flex flex-col items-start">
                <span>{field.label}</span>
                <span className="text-xs text-muted-foreground">
                  {field.type}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}