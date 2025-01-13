export enum EventType {
  UpdateProgramDraft = 'UpdateProgramDraft',
  UpdateProgramRequest = 'UpdateProgramRequest',
  ApproveRequest = 'ApproveRequest',
  UpdateSubject = 'UpdateSubject',
}

export function getEventTypeFromText(text: string): EventType | undefined {
  return Object.values(EventType).find(status  => status.toLowerCase() === text.toLowerCase());
}