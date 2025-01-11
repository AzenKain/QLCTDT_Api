export enum EventType {
  UpdateProgramDraft = 'UpdateProgramDraft',
  UpdateProgramRequest = 'UpdateProgramRequest',
  ApproveRequest = 'ApproveRequest',
  UpdateSubject = 'UpdateSubject',
}

export function getEventTypeFromText(text: string): EventType | undefined {
  const formattedText = text.trim().charAt(0).toUpperCase() + text.trim().slice(1).toLowerCase();
  return Object.values(EventType).find(status => status === formattedText);
}