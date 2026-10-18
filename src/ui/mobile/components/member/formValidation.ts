export function positiveNumberError(value: string, label: string): string | undefined {
  if (!value.trim()) return undefined;
  return Number.isFinite(Number(value)) && Number(value) > 0 ? undefined : `${label} must be a number greater than zero.`;
}

export function progressFormError(weight: string, bodyFat: string, notes: string, activeCalories = ""): string | undefined {
  const error = positiveNumberError(weight, "Weight");
  if (error) return error;
  if (bodyFat.trim() && (!Number.isFinite(Number(bodyFat)) || Number(bodyFat) < 0 || Number(bodyFat) > 100)) return "Body fat must be a number from 0 to 100.";
  if (activeCalories.trim() && (!/^\d+$/.test(activeCalories) || Number(activeCalories) > 100000)) return "Enter a calorie amount from 0 to 100000 kcal.";
  if (!activeCalories.trim() && !weight.trim() && !bodyFat.trim() && !notes.trim()) return "Enter a weight, body fat measurement or note before saving.";
  return undefined;
}

export function supportFormError(category: string, subject: string, message: string): string | undefined {
  if (!category.trim() || category.length > 80) return "Enter a category of 1 to 80 characters.";
  if (subject.trim().length < 2 || subject.length > 180) return "Subject must contain 2 to 180 characters.";
  if (message.trim().length < 2 || message.length > 2000) return "Message must contain 2 to 2,000 characters.";
  return undefined;
}
