import { Employee, IEmployeeOrgApp, Action } from "./interface";
import EmployeeList from "./employeeList";

class EmployeeOrgApp implements IEmployeeOrgApp {
  ceo: Employee;
  employees: Map<number, Employee>; // Employee list mapped by uniqueId
  supervisors: Map<number, number>; // Supervisor-employee relationship
  history: Action[]; // History of operations for undo function
  future: Action[]; // Future operations for redo function

  constructor(ceo: Employee) {
    this.ceo = ceo; // The top of the employee hierarchy
    this.supervisors = new Map(); // Setup supervisor map
    // Construct the initial employee and supervisor relationships
    this.employees = this.generateEmployeeMapList(ceo);
    this.history = [];
    this.future = [];
  }

  // Recursive function to map employee relationships
  generateEmployeeMapList(employee: Employee): Map<number, Employee> {
    const map = new Map<number, Employee>();
    map.set(employee.uniqueId, employee);
    employee.subordinates.forEach((subordinate) => {
      this.generateEmployeeMapList(subordinate).forEach((value, key) => {
        map.set(key, value);
        this.supervisors.set(subordinate.uniqueId, employee.uniqueId);
      });
    });
    return map;
  }

  // Function to move an employee under a new supervisor
  move(employeeID: number, supervisorID: number, isRedo = false): void {
    // Fetch employee and new supervisor from map
    const employee = this.employees.get(employeeID);
    const supervisor = this.employees.get(supervisorID);
    // Fetch current supervisor for employee
    const oldSupervisorID = this.supervisors.get(employeeID) as number;

    // Validation checks
    if (!employee || !supervisor || supervisorID === oldSupervisorID) {
      throw new Error("Invalid operation");
    }

    // Preventing circular supervisor relationships
    let tempSupervisorID = this.supervisors.get(supervisorID);
    while (tempSupervisorID) {
      if (tempSupervisorID === employeeID) {
        throw new Error(
          "A subordinate cannot become a supervisor of its own supervisor"
        );
      }
      tempSupervisorID = this.supervisors.get(tempSupervisorID);
    }

    // Fetch old supervisor
    const oldSupervisor = this.employees.get(oldSupervisorID) as Employee;

    // Reassign subordinates of moving employee to the old supervisor
    employee.subordinates.forEach((sub) => {
      oldSupervisor.subordinates.push(sub);
      this.supervisors.set(sub.uniqueId, oldSupervisorID);
    });

    // Remove moving employee from old supervisor's subordinates list
    let oldPosition = oldSupervisor.subordinates.findIndex(
      (sub) => sub.uniqueId === employeeID
    );
    if (oldPosition !== -1) {
      oldSupervisor.subordinates.splice(oldPosition, 1);
    }

    oldSupervisor.subordinates = oldSupervisor.subordinates.filter(
      (e) => e.uniqueId !== employeeID
    );

    // Add the moving employee to new supervisor's subordinates list
    supervisor.subordinates.push({ ...employee, subordinates: [] });
    // Update the supervisor mapping
    this.supervisors.set(employeeID, supervisorID);

    // If this move is not being performed by a redo operation
    if (!isRedo) {
      // Add operation to history
      this.history.push({
        type: "move",
        payload: {
          employeeID,
          supervisorID,
          oldSupervisorID,
          oldPosition,
          oldSubordinates: [...employee.subordinates],
          newSubordinates: [],
        },
      });
      // Clear future as the timeline has changed
      this.future = [];
    }
  }

  // Function to undo last operation
  undo(): void {
    // If there are no actions in the history, throw an error.
    if (this.history.length === 0) {
      throw new Error("Nothing to undo");
    }

    // Remove the most recent action from the history and add it to the future.
    const action = this.history.pop() as Action;
    this.future.push(action);

    // Get the payload from the action, which includes the ID of the employee,
    // the ID of the old supervisor, and the lists of old and new subordinates.
    const {
      employeeID,
      oldSupervisorID,
      oldSubordinates,
      newSubordinates,
      oldPosition,
    } = action.payload;

    // Get the current supervisor ID and replace it with the old supervisor ID.
    const currentSupervisorID = this.supervisors.get(employeeID) as number;
    // Revert supervisor mapping
    this.supervisors.set(employeeID, oldSupervisorID);

    // Get the current and old supervisors.
    const currentSupervisor = this.employees.get(currentSupervisorID);
    const oldSupervisor = this.employees.get(oldSupervisorID);

    // If both supervisors exist
    if (currentSupervisor && oldSupervisor) {
      // Find the employee among the current supervisor's subordinates.
      const employee = currentSupervisor.subordinates.find(
        (e) => e.uniqueId === employeeID
      );
      if (employee) {
        // Restore the old subordinates for the employee.
        employee.subordinates = oldSubordinates;

        // Remove the employee from the current supervisor's subordinates.
        currentSupervisor.subordinates = currentSupervisor.subordinates.filter(
          (e) => e.uniqueId !== employeeID
        );

        // Filter out the employee and any old subordinates from the old supervisor's subordinates.
        oldSupervisor.subordinates = oldSupervisor.subordinates.filter((e) => {
          if (oldSubordinates.length) {
            for (let sub of oldSubordinates) {
              if (sub.uniqueId === e.uniqueId) {
                return false;
              }
            }
          }

          return e.uniqueId !== employeeID;
        });

        // Set the old subordinates' supervisor to the employee.
        oldSubordinates.forEach((sub) => {
          this.supervisors.set(sub.uniqueId, employeeID);
        });

        // Remove any new subordinates from the old supervisor's subordinates and set their supervisor to the employee.
        newSubordinates.forEach((sub) => {
          const index = oldSupervisor.subordinates.findIndex(
            (e) => e.uniqueId === sub.uniqueId
          );
          if (index > -1) {
            oldSupervisor.subordinates.splice(index, 1);
          }
          this.supervisors.set(sub.uniqueId, employeeID);
        });

        // If oldPosition is not -1 and is a valid position in the array,
        // insert the employee at that position in the old supervisor's subordinates.
        // Otherwise, add the employee to the end of the array.
        if (
          oldPosition !== -1 &&
          oldPosition < oldSupervisor.subordinates.length
        ) {
          oldSupervisor.subordinates.splice(oldPosition, 0, employee);
        } else {
          oldSupervisor.subordinates.push(employee);
        }
      }
    }
  }

  // Function to redo last undone operation
  redo(): void {
    // Check if there's anything to redo
    if (this.future.length === 0) {
      throw new Error("Nothing to redo");
    }

    // Get last operation from future and add it to history
    const action = this.future.pop() as Action;
    this.history.push(action);

    // Extracting action details
    const { employeeID, supervisorID } = action.payload;
    // Perform the move operation again
    this.move(employeeID, supervisorID, true);
  }
}

const app = new EmployeeOrgApp(EmployeeList);
