export interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
}

export interface IEmployeeOrgApp {
  ceo: Employee;
  move(employeeID: number, supervisorID: number): void;
  undo(): void;
  redo(): void;
}

export interface Action {
  type: "move";
  payload: {
    employeeID: number;
    supervisorID: number;
    oldSupervisorID: number;
    oldPosition: number;
    oldSubordinates: Employee[];
    newSubordinates: Employee[];
  };
}
