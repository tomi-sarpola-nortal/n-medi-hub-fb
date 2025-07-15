
"use client";

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import type { Person } from '@/lib/types';

interface SelectDentistDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dentists: Person[];
  onSelectDentist: (dentist: Person) => void;
  t: Record<string, string>;
}

export function SelectDentistDialog({ isOpen, onOpenChange, dentists, onSelectDentist, t }: SelectDentistDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDentists = useMemo(() => {
    if (!searchTerm) return dentists;
    return dentists.filter(dentist => 
      dentist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dentist.dentistId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, dentists]);

  const handleSelect = (dentist: Person) => {
    onSelectDentist(dentist);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.select_dentist_dialog_title || "Select Represented Dentist"}</DialogTitle>
          <DialogDescription>{t.select_dentist_dialog_desc || "Search for a dentist by name or ID and select them."}</DialogDescription>
        </DialogHeader>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder={t.select_dentist_search_placeholder || "Search by name or ID..."} 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <ScrollArea className="h-72">
            <div className="p-1 space-y-1">
                {filteredDentists.length > 0 ? filteredDentists.map(dentist => (
                    <Button 
                        key={dentist.id} 
                        variant="ghost" 
                        className="w-full justify-start h-auto py-2 px-3"
                        onClick={() => handleSelect(dentist)}
                    >
                        <div className="flex flex-col items-start text-left">
                            <span className="font-semibold">{dentist.name}</span>
                            <span className="text-xs text-muted-foreground">ID: {dentist.dentistId || 'N/A'}</span>
                        </div>
                    </Button>
                )) : (
                    <div className="text-center text-muted-foreground p-4">
                        {t.no_dentists_found || "No dentists found."}
                    </div>
                )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
