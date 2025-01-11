
export enum GenderType {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}

export enum PositionType {
  Student = "Student",
  Lecturer = "Lecturer",
}

export function getGenderTypeFromText(text: string): GenderType | undefined {
  const formattedText = text.trim().charAt(0).toUpperCase() + text.trim().slice(1).toLowerCase();
  return Object.values(GenderType).find(status => status === formattedText);
}

export function getPositionTypeFromText(text: string): PositionType | undefined {
  const formattedText = text.trim().charAt(0).toUpperCase() + text.trim().slice(1).toLowerCase();
  return Object.values(PositionType).find(status => status === formattedText);
}