// Side quest: plug-in validation. Teams register rules without changing the extraction code.
import type { AppointmentDetails } from './schemas.js';

export type Issue = { field: string; message: string };
export type Rule = { name: string; check: (a: AppointmentDetails) => Issue | null };

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  errors: Issue[];
  warnings: Issue[];
}

const rules: Rule[] = [];

export function registerRule(rule: Rule) {
  rules.push(rule);
}

export function validateAppointment(a: AppointmentDetails): ValidationResult {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  for (const rule of rules) {
    const issue = rule.check(a);
    if (issue) (rule.name.startsWith('warn:') ? warnings : errors).push(issue);
  }
  const confidence = Math.max(0, 1 - errors.length * 0.4 - warnings.length * 0.1);
  return { isValid: errors.length === 0, confidence: Number(confidence.toFixed(2)), errors, warnings };
}

// Built-in rules. Downstream teams call registerRule() with their own.
registerRule({
  name: 'date-format',
  check: (a) => (/^\d{4}-\d{2}-\d{2}$/.test(a.date) ? null : { field: 'date', message: 'Date must be YYYY-MM-DD' }),
});
registerRule({
  name: 'time-format',
  check: (a) => {
    for (const f of ['startTime', 'endTime'] as const) {
      const v = a[f];
      if (v !== null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) return { field: f, message: `${f} must be HH:MM` };
    }
    return null;
  },
});
registerRule({
  name: 'warn:missing-end',
  check: (a) => (a.startTime && !a.endTime ? { field: 'endTime', message: 'No end time; one hour assumed' } : null),
});
