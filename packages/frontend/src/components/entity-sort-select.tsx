import { useMemo, useState } from 'react';
import { Button } from '../shared/ui/button';
import { t } from '../shared/lib/i18n';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../shared/ui/popover';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '../shared/ui/command';
import { InputGroup, InputGroupSection } from '../shared/ui/input-group';
import { Toggle } from '../shared/ui/toggle';

export function EntitySortSelect<TValue extends string>({
  options,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
}: {
  options: Array<{ value: TValue; label: string }>;
  sortBy: TValue;
  sortDirection: 'asc' | 'desc';
  onSortByChange: (value: TValue) => void;
  onSortDirectionChange: (value: 'asc' | 'desc') => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const activeOption = useMemo(
    () => options.find((option) => option.value === sortBy),
    [options, sortBy],
  );

  return (
    <InputGroup className="">
      <InputGroupSection className="p-1 min-w-0 flex-1">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={isOpen}
              className="h-full justify-between px-4 text-sm font-medium text-foreground hover:bg-muted"
              role="combobox"
              type="button"
              variant="ghost"
            >
              <span className="truncate">{activeOption?.label ?? t('common.sort')}</span>
              <span className="ml-3 text-xs text-muted-foreground">▾</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[260px] p-0">
            <Command>
              <CommandList>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        onSortByChange(option.value);
                        setIsOpen(false);
                      }}
                    >
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </InputGroupSection>
      <InputGroupSection className="p-1">
        <Toggle
          aria-label={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'}
          className="h-full rounded-sm"
          pressed={sortDirection === 'desc'}
          onPressedChange={(pressed) => onSortDirectionChange(pressed ? 'desc' : 'asc')}
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </Toggle>
      </InputGroupSection>
    </InputGroup>
  );
}
