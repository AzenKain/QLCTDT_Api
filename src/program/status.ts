export enum ProgramStatus {
  None = '',
  Created = 'Created',
  Pending = 'Pending',
  Accept = 'Accept',
  Cancelled = 'Cancelled',
}

export enum ProgramStage {
  Draft = 'Draft',
  Request = 'Request',
  Final = 'Final',
}

export function getProgramStatusFromText(text: string): ProgramStatus | undefined {
  const formattedText = text.trim().charAt(0).toUpperCase() + text.trim().slice(1).toLowerCase();
  return Object.values(ProgramStatus).find(status => status === formattedText);
}

const stageTransitions: Record<ProgramStage, ProgramStatus[]> = {
  [ProgramStage.Draft]: [ProgramStatus.None, ProgramStatus.Created],
  [ProgramStage.Request]: [ProgramStatus.Pending],
  [ProgramStage.Final]: [ProgramStatus.Accept, ProgramStatus.Cancelled],
};

const validTransitions: Record<ProgramStatus, ProgramStatus[]> = {
  [ProgramStatus.None]: [ProgramStatus.Created, ProgramStatus.Cancelled],
  [ProgramStatus.Created]: [ProgramStatus.Pending, ProgramStatus.Cancelled],
  [ProgramStatus.Pending]: [ProgramStatus.Accept, ProgramStatus.Cancelled],
  [ProgramStatus.Accept]: [],
  [ProgramStatus.Cancelled]: [],
};

export function canTransitionTo(currentStatus: ProgramStatus, nextStatus: ProgramStatus): boolean {
  return validTransitions[currentStatus]?.includes(nextStatus) || false;
}

export function canUseAction(currentStatus: ProgramStatus, currentStage: ProgramStage): boolean {
  return stageTransitions[currentStage]?.includes(currentStatus) || false;
}