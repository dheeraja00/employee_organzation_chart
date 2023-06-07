// import { Employee, IEmployeeOrgApp, Action } from "./interface";
// import EmployeeList from "./employeeList";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var EmployeeList = {
    uniqueId: 1,
    name: "Mark Zuckerberg",
    subordinates: [
        {
            uniqueId: 2,
            name: "Sarah Donald",
            subordinates: [
                {
                    uniqueId: 3,
                    name: "Cassandra Reynolds",
                    subordinates: [
                        {
                            uniqueId: 4,
                            name: "Mary Blue",
                            subordinates: [],
                        },
                        {
                            uniqueId: 5,
                            name: "Bob Saget",
                            subordinates: [
                                {
                                    uniqueId: 6,
                                    name: "Tina Teff",
                                    subordinates: [
                                        {
                                            uniqueId: 7,
                                            name: "Will Turner",
                                            subordinates: [],
                                        },
                                        {
                                            uniqueId: 16,
                                            name: "Dheeraj Agrawal",
                                            subordinates: [],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            uniqueId: 8,
            name: "Tyler Simpson",
            subordinates: [
                {
                    uniqueId: 9,
                    name: "Harry Tobs",
                    subordinates: [
                        {
                            uniqueId: 10,
                            name: "Thomas Brown",
                            subordinates: [],
                        },
                    ],
                },
                {
                    uniqueId: 11,
                    name: "George Carrey",
                    subordinates: [],
                },
                {
                    uniqueId: 12,
                    name: "Gary Styles",
                    subordinates: [],
                },
            ],
        },
        {
            uniqueId: 13,
            name: "Bruce Willis",
            subordinates: [],
        },
        {
            uniqueId: 14,
            name: "Georgina Flangy",
            subordinates: [
                {
                    uniqueId: 15,
                    name: "Sophie Turner",
                    subordinates: [],
                },
            ],
        },
    ],
};
var EmployeeOrgApp = /** @class */ (function () {
    function EmployeeOrgApp(ceo) {
        this.ceo = ceo; // The top of the employee hierarchy
        this.supervisors = new Map(); // Setup supervisor map
        // Construct the initial employee and supervisor relationships
        this.employees = this.generateEmployeeMapList(ceo);
        this.history = [];
        this.future = [];
    }
    // Recursive function to map employee relationships
    EmployeeOrgApp.prototype.generateEmployeeMapList = function (employee) {
        var _this = this;
        var map = new Map();
        map.set(employee.uniqueId, employee);
        employee.subordinates.forEach(function (subordinate) {
            _this.generateEmployeeMapList(subordinate).forEach(function (value, key) {
                map.set(key, value);
                _this.supervisors.set(subordinate.uniqueId, employee.uniqueId);
            });
        });
        return map;
    };
    // Function to move an employee under a new supervisor
    EmployeeOrgApp.prototype.move = function (employeeID, supervisorID, isRedo) {
        var _this = this;
        if (isRedo === void 0) { isRedo = false; }
        // Fetch employee and new supervisor from map
        var employee = this.employees.get(employeeID);
        var supervisor = this.employees.get(supervisorID);
        // Fetch current supervisor for employee
        var oldSupervisorID = this.supervisors.get(employeeID);
        // Validation checks
        if (!employee || !supervisor || supervisorID === oldSupervisorID) {
            throw new Error("Invalid operation");
        }
        // Preventing circular supervisor relationships
        var tempSupervisorID = this.supervisors.get(supervisorID);
        while (tempSupervisorID) {
            if (tempSupervisorID === employeeID) {
                throw new Error("A subordinate cannot become a supervisor of its own supervisor");
            }
            tempSupervisorID = this.supervisors.get(tempSupervisorID);
        }
        // Fetch old supervisor
        var oldSupervisor = this.employees.get(oldSupervisorID);
        // Reassign subordinates of moving employee to the old supervisor
        employee.subordinates.forEach(function (sub) {
            oldSupervisor.subordinates.push(sub);
            _this.supervisors.set(sub.uniqueId, oldSupervisorID);
        });
        // Remove moving employee from old supervisor's subordinates list
        var oldPosition = oldSupervisor.subordinates.findIndex(function (sub) { return sub.uniqueId === employeeID; });
        if (oldPosition !== -1) {
            oldSupervisor.subordinates.splice(oldPosition, 1);
        }
        oldSupervisor.subordinates = oldSupervisor.subordinates.filter(function (e) { return e.uniqueId !== employeeID; });
        // Add the moving employee to new supervisor's subordinates list
        supervisor.subordinates.push(__assign(__assign({}, employee), { subordinates: [] }));
        // Update the supervisor mapping
        this.supervisors.set(employeeID, supervisorID);
        // If this move is not being performed by a redo operation
        if (!isRedo) {
            // Add operation to history
            this.history.push({
                type: "move",
                payload: {
                    employeeID: employeeID,
                    supervisorID: supervisorID,
                    oldSupervisorID: oldSupervisorID,
                    oldPosition: oldPosition,
                    oldSubordinates: __spreadArray([], employee.subordinates, true),
                    newSubordinates: [],
                },
            });
            // Clear future as the timeline has changed
            this.future = [];
        }
    };
    // Function to undo last operation
    EmployeeOrgApp.prototype.undo = function () {
        var _this = this;
        // If there are no actions in the history, throw an error.
        if (this.history.length === 0) {
            throw new Error("Nothing to undo");
        }
        // Remove the most recent action from the history and add it to the future.
        var action = this.history.pop();
        this.future.push(action);
        // Get the payload from the action, which includes the ID of the employee,
        // the ID of the old supervisor, and the lists of old and new subordinates.
        var _a = action.payload, employeeID = _a.employeeID, oldSupervisorID = _a.oldSupervisorID, oldSubordinates = _a.oldSubordinates, newSubordinates = _a.newSubordinates, oldPosition = _a.oldPosition;
        // Get the current supervisor ID and replace it with the old supervisor ID.
        var currentSupervisorID = this.supervisors.get(employeeID);
        // Revert supervisor mapping
        this.supervisors.set(employeeID, oldSupervisorID);
        // Get the current and old supervisors.
        var currentSupervisor = this.employees.get(currentSupervisorID);
        var oldSupervisor = this.employees.get(oldSupervisorID);
        // If both supervisors exist
        if (currentSupervisor && oldSupervisor) {
            // Find the employee among the current supervisor's subordinates.
            var employee = currentSupervisor.subordinates.find(function (e) { return e.uniqueId === employeeID; });
            if (employee) {
                // Restore the old subordinates for the employee.
                employee.subordinates = oldSubordinates;
                // Remove the employee from the current supervisor's subordinates.
                currentSupervisor.subordinates = currentSupervisor.subordinates.filter(function (e) { return e.uniqueId !== employeeID; });
                // Filter out the employee and any old subordinates from the old supervisor's subordinates.
                oldSupervisor.subordinates = oldSupervisor.subordinates.filter(function (e) {
                    if (oldSubordinates.length) {
                        for (var _i = 0, oldSubordinates_1 = oldSubordinates; _i < oldSubordinates_1.length; _i++) {
                            var sub = oldSubordinates_1[_i];
                            if (sub.uniqueId === e.uniqueId) {
                                return false;
                            }
                        }
                    }
                    return e.uniqueId !== employeeID;
                });
                // Set the old subordinates' supervisor to the employee.
                oldSubordinates.forEach(function (sub) {
                    _this.supervisors.set(sub.uniqueId, employeeID);
                });
                // Remove any new subordinates from the old supervisor's subordinates and set their supervisor to the employee.
                newSubordinates.forEach(function (sub) {
                    var index = oldSupervisor.subordinates.findIndex(function (e) { return e.uniqueId === sub.uniqueId; });
                    if (index > -1) {
                        oldSupervisor.subordinates.splice(index, 1);
                    }
                    _this.supervisors.set(sub.uniqueId, employeeID);
                });
                // If oldPosition is not -1 and is a valid position in the array,
                // insert the employee at that position in the old supervisor's subordinates.
                // Otherwise, add the employee to the end of the array.
                if (oldPosition !== -1 &&
                    oldPosition < oldSupervisor.subordinates.length) {
                    oldSupervisor.subordinates.splice(oldPosition, 0, employee);
                }
                else {
                    oldSupervisor.subordinates.push(employee);
                }
            }
        }
    };
    // Function to redo last undone operation
    EmployeeOrgApp.prototype.redo = function () {
        // Check if there's anything to redo
        if (this.future.length === 0) {
            throw new Error("Nothing to redo");
        }
        // Get last operation from future and add it to history
        var action = this.future.pop();
        this.history.push(action);
        // Extracting action details
        var _a = action.payload, employeeID = _a.employeeID, supervisorID = _a.supervisorID;
        // Perform the move operation again
        this.move(employeeID, supervisorID, true);
    };
    return EmployeeOrgApp;
}());
var app = new EmployeeOrgApp(EmployeeList);
