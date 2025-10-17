import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Calendar } from '@/shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Button } from '@/shared/ui/button';
import { format } from 'date-fns';
import { CalendarDays, Check, Pencil } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

type EditableFieldType = 'text' | 'textarea' | 'number' | 'currency' | 'select' | 'date';

interface EditableFieldProps {
  label: string;
  description?: string;
  value: string | number | null | undefined;
  placeholder?: string;
  type?: EditableFieldType;
  options?: Array<{ value: string; label: string }>;
  isLoading?: boolean;
  onSave: (value: string | number | null) => Promise<void> | void;
  className?: string;
}

export function EditableField({
  label,
  description,
  value,
  placeholder,
  type = 'text',
  options,
  isLoading,
  onSave,
  className,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState<string>('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(value === null || value === undefined ? '' : String(value));
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(async () => {
    let payload: string | number | null = draftValue.trim();

    if (payload === '') {
      payload = null;
    } else if (type === 'number' || type === 'currency') {
      const parsed = Number(payload.replace(/[^0-9.-]+/g, ''));
      payload = Number.isFinite(parsed) ? parsed : null;
    }

    await onSave(payload);
    setIsEditing(false);
  }, [draftValue, onSave, type]);

  const renderStaticValue = () => {
    if ((value === null || value === undefined || value === '') && placeholder) {
      return <span className="text-white/40">{placeholder}</span>;
    }

    if (value === null || value === undefined || value === '') {
      return <span className="text-white/40">—</span>;
    }

    if (type === 'currency') {
      const amount = Number(value);
      if (!Number.isFinite(amount)) {
        return value;
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(amount);
    }

    if (type === 'date') {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return value;
      }
      return format(date, 'MMMM d, yyyy');
    }

    return value;
  };

  const renderEditor = () => {
    switch (type) {
      case 'select': {
        return (
          <Select
            value={draftValue}
            onValueChange={(next) => {
              setDraftValue(next);
              onSave(next);
              setIsEditing(false);
            }}
          >
            <SelectTrigger className="h-10 bg-black/40 border-white/10 text-white">
              <SelectValue placeholder={placeholder ?? 'Select…'} />
            </SelectTrigger>
            <SelectContent className="bg-[#11101A] border-white/10 text-white">
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      case 'date': {
        return (
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal bg-black/40 border-white/10 text-white hover:bg-black/50"
              >
                <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                {draftValue ? format(new Date(draftValue), 'MMMM d, yyyy') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#11101A] border-white/10">
              <Calendar
                mode="single"
                selected={draftValue ? new Date(draftValue) : undefined}
                onSelect={(date) => {
                  const iso = date ? date.toISOString() : '';
                  setDraftValue(iso);
                  onSave(date ? iso : null);
                  setIsCalendarOpen(false);
                  setIsEditing(false);
                }}
              />
            </PopoverContent>
          </Popover>
        );
      }
      case 'textarea': {
        return (
          <textarea
            ref={(element) => (inputRef.current = element)}
            value={draftValue}
            rows={4}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={handleSave}
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-siso-orange/60 focus:ring-2 focus:ring-siso-orange/20"
            placeholder={placeholder}
          />
        );
      }
      default: {
        return (
          <Input
            ref={(element) => (inputRef.current = element)}
            type={type === 'number' || type === 'currency' ? 'text' : type}
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={handleSave}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSave();
              } else if (event.key === 'Escape') {
                event.preventDefault();
                setIsEditing(false);
                setDraftValue(value ? String(value) : '');
              }
            }}
            className="bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-siso-orange/60 focus:ring-2 focus:ring-siso-orange/20"
            placeholder={placeholder}
          />
        );
      }
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/5 p-5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all duration-200 hover:border-siso-orange/40',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">{label}</p>
          {description && <p className="mt-1 text-xs text-white/40">{description}</p>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
          onClick={() => setIsEditing(true)}
          disabled={isLoading}
        >
          {isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </Button>
      </div>

      <div
        className={cn(
          'mt-4 text-lg font-semibold text-white min-h-[1.5rem]',
          isEditing && 'text-white/80',
        )}
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {isEditing ? renderEditor() : renderStaticValue()}
      </div>
    </div>
  );
}
