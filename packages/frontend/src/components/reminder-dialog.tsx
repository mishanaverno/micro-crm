import { FormEvent } from 'react';
import {
  ReminderDateTimeField,
  isReminderDateTimeReady,
} from './reminder-date-time-field';
import { Button } from '../shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../shared/ui/dialog';
import { Label } from '../shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shared/ui/select';
import { Textarea } from '../shared/ui/textarea';

interface Option {
  value: string;
  label: string;
}

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  content: string;
  timestamp: string;
  onContentChange: (value: string) => void;
  onTimestampChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  isPending?: boolean;
  isSubmitDisabled?: boolean;
  formId?: string;
  clientField:
    | {
        mode: 'select';
        value: string;
        options: Option[];
        disabled?: boolean;
        placeholder?: string;
        onChange: (value: string) => void;
      }
    | {
        mode: 'fixed';
        label: string;
      };
  orderField:
    | {
        mode: 'select';
        value: string;
        options: Option[];
        disabled?: boolean;
        placeholder?: string;
        emptyLabel?: string;
        onChange: (value: string) => void;
      }
    | {
        mode: 'fixed';
        label: string;
      };
}

export function ReminderDialog({
  open,
  onOpenChange,
  title,
  description,
  content,
  timestamp,
  onContentChange,
  onTimestampChange,
  onSubmit,
  submitLabel,
  isPending = false,
  isSubmitDisabled = false,
  formId = 'reminder-dialog-form',
  clientField,
  orderField,
}: ReminderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" id={formId} onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor={`${formId}-client`}>Client</Label>
            {clientField.mode === 'select' ? (
              <Select
                disabled={clientField.disabled}
                value={clientField.value || undefined}
                onValueChange={clientField.onChange}
              >
                <SelectTrigger id={`${formId}-client`}>
                  <SelectValue placeholder={clientField.placeholder ?? 'Select client'} />
                </SelectTrigger>
                <SelectContent>
                  {clientField.options.map((client) => (
                    <SelectItem key={client.value} value={client.value}>
                      {client.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground">
                {clientField.label}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${formId}-order`}>Order</Label>
            {orderField.mode === 'select' ? (
              <Select
                disabled={orderField.disabled}
                value={orderField.value || '__none__'}
                onValueChange={(value) =>
                  orderField.onChange(value === '__none__' ? '' : value)
                }
              >
                <SelectTrigger id={`${formId}-order`}>
                  <SelectValue placeholder={orderField.placeholder ?? 'No order'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    {orderField.emptyLabel ?? 'No order'}
                  </SelectItem>
                  {orderField.options.map((order) => (
                    <SelectItem key={order.value} value={order.value}>
                      {order.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground">
                {orderField.label}
              </p>
            )}
          </div>

          <ReminderDateTimeField
            idPrefix={`${formId}-timestamp`}
            label="Timestamp"
            required
            value={timestamp}
            onChange={onTimestampChange}
          />

          <div className="grid gap-2">
            <Label htmlFor={`${formId}-content`}>Content</Label>
            <Textarea
              id={`${formId}-content`}
              required
              value={content}
              onChange={(event) => onContentChange(event.target.value)}
            />
          </div>
        </form>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button" variant="ghost">
            Cancel
          </Button>
          <Button
            disabled={
              isPending ||
              isSubmitDisabled ||
              !isReminderDateTimeReady(timestamp)
            }
            form={formId}
            type="submit"
          >
            {isPending ? 'Saving...' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
