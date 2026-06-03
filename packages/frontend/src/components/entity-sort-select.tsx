import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shared/ui/select';
import { t } from '../shared/lib/i18n';

export function EntitySortSelect<TValue extends string>({
  options,
  value,
  onValueChange,
}: {
  options: Array<{ value: TValue; label: string }>;
  value: TValue;
  onValueChange: (value: TValue) => void;
}) {
  return (
    <Select value={value} onValueChange={(nextValue) => onValueChange(nextValue as TValue)}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder={t('common.sort')} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
