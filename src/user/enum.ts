
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
  return Object.values(GenderType).find(status => status.toLowerCase()=== text.toLowerCase());
}

export function getPositionTypeFromText(text: string): PositionType | undefined {
  return Object.values(PositionType).find(status => status.toLowerCase()=== text.toLowerCase());
}