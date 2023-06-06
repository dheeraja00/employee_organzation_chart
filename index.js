// import { Employee, IEmployeeOrgApp, Action } from "./interface";
// import EmployeeList from "./employeeList";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
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
    this.ceo = ceo;
    this.supervisors = new Map();
    this.employees = this.buildEmployeeMap(ceo);
    this.history = [];
    this.future = [];
  }
  EmployeeOrgApp.prototype.buildEmployeeMap = function (employee) {
    var _this = this;
    var map = new Map();
    map.set(employee.uniqueId, employee);
    employee.subordinates.forEach(function (subordinate) {
      _this.buildEmployeeMap(subordinate).forEach(function (value, key) {
        map.set(key, value);
        _this.supervisors.set(subordinate.uniqueId, employee.uniqueId);
      });
    });
    return map;
  };
  EmployeeOrgApp.prototype.move = function (employeeID, supervisorID, isRedo) {
    var _this = this;
    if (isRedo === void 0) {
      isRedo = false;
    }
    var employee = this.employees.get(employeeID);
    var supervisor = this.employees.get(supervisorID);
    var oldSupervisorID = this.supervisors.get(employeeID);
    if (!employee || !supervisor || supervisorID === oldSupervisorID) {
      throw new Error("Invalid operation");
    }
    var tempSupervisorID = this.supervisors.get(supervisorID);
    while (tempSupervisorID) {
      if (tempSupervisorID === employeeID) {
        throw new Error(
          "A subordinate cannot become a supervisor of its own supervisor"
        );
      }
      tempSupervisorID = this.supervisors.get(tempSupervisorID);
    }
    var oldSupervisor = this.employees.get(oldSupervisorID);
    employee.subordinates.forEach(function (sub) {
      oldSupervisor.subordinates.push(sub);
      _this.supervisors.set(sub.uniqueId, oldSupervisorID);
    });
    var oldPosition = oldSupervisor.subordinates.findIndex(function (sub) {
      return sub.uniqueId === employeeID;
    });
    if (oldPosition !== -1) {
      oldSupervisor.subordinates.splice(oldPosition, 1);
    }
    oldSupervisor.subordinates = oldSupervisor.subordinates.filter(function (
      e
    ) {
      return e.uniqueId !== employeeID;
    });
    supervisor.subordinates.push(
      __assign(__assign({}, employee), { subordinates: [] })
    );
    this.supervisors.set(employeeID, supervisorID);
    if (!isRedo) {
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
      this.future = [];
    }
  };
  EmployeeOrgApp.prototype.undo = function () {
    var _this = this;
    if (this.history.length === 0) {
      throw new Error("Nothing to undo");
    }
    var action = this.history.pop();
    this.future.push(action);
    var _a = action.payload,
      employeeID = _a.employeeID,
      oldSupervisorID = _a.oldSupervisorID,
      oldSubordinates = _a.oldSubordinates,
      newSubordinates = _a.newSubordinates,
      oldPosition = _a.oldPosition;
    var currentSupervisorID = this.supervisors.get(employeeID);
    this.supervisors.set(employeeID, oldSupervisorID);
    var currentSupervisor = this.employees.get(currentSupervisorID);
    var oldSupervisor = this.employees.get(oldSupervisorID);
    if (currentSupervisor && oldSupervisor) {
      var employee = currentSupervisor.subordinates.find(function (e) {
        return e.uniqueId === employeeID;
      });
      if (employee) {
        employee.subordinates = oldSubordinates;
        currentSupervisor.subordinates = currentSupervisor.subordinates.filter(
          function (e) {
            return e.uniqueId !== employeeID;
          }
        );
        oldSupervisor.subordinates = oldSupervisor.subordinates.filter(
          function (e) {
            if (oldSubordinates.length) {
              for (
                var _i = 0, oldSubordinates_1 = oldSubordinates;
                _i < oldSubordinates_1.length;
                _i++
              ) {
                var sub = oldSubordinates_1[_i];
                if (sub.uniqueId === e.uniqueId) {
                  return false;
                }
              }
            }
            return e.uniqueId !== employeeID;
          }
        );
        oldSubordinates.forEach(function (sub) {
          _this.supervisors.set(sub.uniqueId, employeeID);
        });
        newSubordinates.forEach(function (sub) {
          var index = oldSupervisor.subordinates.findIndex(function (e) {
            return e.uniqueId === sub.uniqueId;
          });
          if (index > -1) {
            oldSupervisor.subordinates.splice(index, 1);
          }
          _this.supervisors.set(sub.uniqueId, employeeID);
        });
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
  };
  EmployeeOrgApp.prototype.redo = function () {
    if (this.future.length === 0) {
      throw new Error("Nothing to redo");
    }
    var action = this.future.pop();
    this.history.push(action);
    var _a = action.payload,
      employeeID = _a.employeeID,
      supervisorID = _a.supervisorID;
    this.move(employeeID, supervisorID, true);
  };
  return EmployeeOrgApp;
})();
var app = new EmployeeOrgApp(EmployeeList);
