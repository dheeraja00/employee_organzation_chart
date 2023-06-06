# EmployeeOrgApp

## Overview

The `EmployeeOrgApp` is a class designed to handle operations in an organizational hierarchy of employees. This class supports operations such as moving an employee to a different supervisor and undoing or redoing such operations. It is particularly useful for managing and visualizing organizational structures.

## Usage

### Initialization

The class is initialized with a `ceo` employee, which is the root of the organizational hierarchy. It also builds a map of all employees for fast access, and a supervisors map to quickly lookup the supervisor for any employee.

### Moving an Employee

The `move` operation changes the supervisor of an employee. When an employee is moved, it is removed from its current supervisor's subordinates list and added to the new supervisor's subordinates list. The `move` operation checks for potential cycles or invalid operations.

### Undo and Redo

The `undo` operation reverts the last `move` operation, and the `redo` operation re-applies the last undone `move` operation. The `undo` and `redo` operations are based on the command pattern and make use of `history` and `future` stacks to keep track of past actions.

## Under The Hood

### Employee and Supervisor Maps

The `employees` map is a key-value pair where the key is the employee's unique ID and the value is the employee's data. This map is used for fast access to any employee in the hierarchy.

The `supervisors` map is another key-value pair where the key is an employee's unique ID and the value is the unique ID of the supervisor of that employee. This map is used for fast access to the supervisor of any employee.

### Command Pattern for Undo and Redo

The `undo` and `redo` functionality is implemented using the command pattern. Each `move` operation is stored as an `Action` in a `history` stack. When an `undo` operation is performed, the last `Action` from the `history` stack is reverted and pushed to the `future` stack. When a `redo` operation is performed, the last `Action` from the `future` stack is reapplied and pushed back to the `history` stack.

### Preventing Cycles

To prevent creating a cycle in the hierarchy, before moving an employee, the `move` operation checks if the new supervisor is currently a subordinate of the employee being moved. If this is the case, the `move` operation throws an error and is not performed.
