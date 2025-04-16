class CSPSolver {
  constructor(courses, timeSlots, constraints, groupCount = 6) {
    this.courses = this.expandCoursesForGroups(courses, groupCount);
    this.timeSlots = this.generateTimeSlots(timeSlots);
    this.constraints = constraints;
    this.groupCount = groupCount;
    this.totalGroups = 6;
    this.assignment = {};
    this.domains = {};
    this.stats = {
      backtrackCalls: 0,
      failedAssignments: 0,
    };
    this.steps = {};
  }

  expandCoursesForGroups(courses, groupCount) {
    const expandedCourses = [];
    let idCounter = 1;

    for (let groupId = 1; groupId <= groupCount; groupId++) {
      courses.forEach((course) => {
        expandedCourses.push({
          id: idCounter++,
          name: course.name,
          type: course.type,
          teacher: course.teacher,
          groupId: `G${groupId}`,
        });
      });
    }

    return expandedCourses;
  }

  generateTimeSlots(weekObj) {
    const slots = [];
    const hours = ["8:00", "9:30", "11:00", "12:30", "14:00"];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

    days.forEach((day) => {
      hours.forEach((hour) => {
        // Skip afternoon slots on Tuesday due to constraint
        if (day === "Tuesday" && (hour === "12:30" || hour === "14:00")) {
          return;
        }
        slots.push({ day, hour });
      });
    });

    return slots;
  }

  initializeDomains() {
    this.courses.forEach((course) => {
      this.domains[course.id] = [...this.timeSlots];
    });
  }

  isConsistent(courseId, timeSlot, skipConstraintIds = []) {
    const course = this.courses.find((c) => c.id === courseId);

    for (const constraint of this.constraints.hardConstraints) {
      if (!constraint.enabled || skipConstraintIds.includes(constraint.id))
        continue;

      switch (constraint.id) {
        case 1:
          if (!this.checkMaxSuccessiveSlots(course, timeSlot)) return false;
          break;
        case 2:
          if (!this.checkNoSameCourseInSameSlot(course, timeSlot)) return false;
          break;
        case 3:
          if (!this.checkDifferentCoursesForSameGroup(course, timeSlot))
            return false;
          break;
        case 4:
          if (
            timeSlot.day === "Tuesday" &&
            (timeSlot.hour === "12:30" || timeSlot.hour === "14:00")
          ) {
            return false;
          }
          break;
      }
    }

    for (const constraint of this.constraints.softConstraints) {
      if (!constraint.enabled || skipConstraintIds.includes(constraint.id))
        continue;

      switch (constraint.id) {
        case 1:
          if (!this.checkTeacherMaxTwoDays(course, timeSlot)) return false;
          break;
      }
    }

    return true;
  }

  checkMaxSuccessiveSlots(course, timeSlot) {
    const hours = ["8:00", "9:30", "11:00", "12:30", "14:00"];
    const hourIdx = hours.indexOf(timeSlot.hour);

    let consecutiveBefore = 0;
    for (let i = hourIdx - 1; i >= 0; i--) {
      const prevSlot = { day: timeSlot.day, hour: hours[i] };
      const slotOccupied = Object.entries(this.assignment).some(
        ([assignedCourseId, assignedSlot]) => {
          const assignedCourse = this.courses.find(
            (c) => c.id === parseInt(assignedCourseId)
          );
          return (
            assignedCourse.groupId === course.groupId &&
            assignedSlot.day === prevSlot.day &&
            assignedSlot.hour === prevSlot.hour
          );
        }
      );

      if (slotOccupied) {
        consecutiveBefore++;
      } else {
        break;
      }
    }

    let consecutiveAfter = 0;
    for (let i = hourIdx + 1; i < hours.length; i++) {
      const nextSlot = { day: timeSlot.day, hour: hours[i] };
      const slotOccupied = Object.entries(this.assignment).some(
        ([assignedCourseId, assignedSlot]) => {
          const assignedCourse = this.courses.find(
            (c) => c.id === parseInt(assignedCourseId)
          );
          return (
            assignedCourse.groupId === course.groupId &&
            assignedSlot.day === nextSlot.day &&
            assignedSlot.hour === nextSlot.hour
          );
        }
      );

      if (slotOccupied) {
        consecutiveAfter++;
      } else {
        break;
      }
    }

    return consecutiveBefore + consecutiveAfter + 1 <= 3;
  }

  checkNoSameCourseInSameSlot(course, timeSlot) {
    const sameCourseDifferentType = this.courses.filter(
      (c) => c.id !== course.id && c.name === course.name
    );

    return !sameCourseDifferentType.some((c) => {
      const assignedSlot = this.assignment[c.id];
      return (
        assignedSlot &&
        assignedSlot.day === timeSlot.day &&
        assignedSlot.hour === timeSlot.hour
      );
    });
  }

  checkDifferentCoursesForSameGroup(course, timeSlot) {
    return !Object.entries(this.assignment).some(
      ([assignedCourseId, assignedSlot]) => {
        const assignedCourse = this.courses.find(
          (c) => c.id === parseInt(assignedCourseId)
        );
        return (
          assignedCourse.groupId === course.groupId &&
          assignedSlot.day === timeSlot.day &&
          assignedSlot.hour === timeSlot.hour
        );
      }
    );
  }

  checkTeacherAvailability(course, timeSlot) {
    return !Object.entries(this.assignment).some(
      ([assignedCourseId, assignedSlot]) => {
        const assignedCourse = this.courses.find(
          (c) => c.id === parseInt(assignedCourseId)
        );
        return (
          assignedCourse.teacher === course.teacher &&
          assignedSlot.day === timeSlot.day &&
          assignedSlot.hour === timeSlot.hour
        );
      }
    );
  }

  checkTeacherMaxTwoDays(course, timeSlot) {
    const teacherDays = new Set();

    Object.entries(this.assignment).forEach(
      ([assignedCourseId, assignedSlot]) => {
        const assignedCourse = this.courses.find(
          (c) => c.id === parseInt(assignedCourseId)
        );
        if (assignedCourse.teacher === course.teacher) {
          teacherDays.add(assignedSlot.day);
        }
      }
    );

    if (!teacherDays.has(timeSlot.day) && teacherDays.size >= 2) {
      return false;
    }

    return true;
  }

  ac3() {
    const queue = [];

    for (let i = 0; i < this.courses.length; i++) {
      const courseA = this.courses[i];
      for (let j = 0; j < this.courses.length; j++) {
        if (i !== j) {
          const courseB = this.courses[j];

          if (
            courseA.groupId === courseB.groupId ||
            courseA.teacher === courseB.teacher ||
            courseA.name === courseB.name
          ) {
            queue.push([courseA.id, courseB.id]);
          }
        }
      }
    }

    while (queue.length > 0) {
      const [xi, xj] = queue.shift();

      if (this.revise(xi, xj)) {
        if (this.domains[xi].length === 0) {
          return false;
        }

        for (const course of this.courses) {
          if (course.id !== xi && course.id !== xj) {
            const courseXi = this.courses.find((c) => c.id === xi);

            if (
              course.groupId === courseXi.groupId ||
              course.teacher === courseXi.teacher ||
              course.name === courseXi.name
            ) {
              queue.push([course.id, xi]);
            }
          }
        }
      }
    }

    return true;
  }

  revise(xi, xj) {
    let revised = false;
    const courseI = this.courses.find((c) => c.id === xi);
    const courseJ = this.courses.find((c) => c.id === xj);

    for (let i = this.domains[xi].length - 1; i >= 0; i--) {
      const slotI = this.domains[xi][i];
      let hasSupport = false;

      for (const slotJ of this.domains[xj]) {
        if (this.areConsistent(courseI, slotI, courseJ, slotJ)) {
          hasSupport = true;
          break;
        }
      }

      if (!hasSupport) {
        this.domains[xi].splice(i, 1);
        revised = true;
      }
    }

    return revised;
  }

  areConsistent(courseI, slotI, courseJ, slotJ) {
    if (
      courseI.name === courseJ.name &&
      slotI.day === slotJ.day &&
      slotI.hour === slotJ.hour
    ) {
      return false;
    }

    if (
      courseI.groupId === courseJ.groupId &&
      slotI.day === slotJ.day &&
      slotI.hour === slotJ.hour
    ) {
      return false;
    }

    if (
      courseI.teacher === courseJ.teacher &&
      slotI.day === slotJ.day &&
      slotI.hour === slotJ.hour
    ) {
      return false;
    }

    return true;
  }

  removeInconsistentValues(xi, xj) {
    let removed = false;
    const courseI = this.courses.find((c) => c.id === xi);
    const courseJ = this.courses.find((c) => c.id === xj);

    for (let i = this.domains[xi].length - 1; i >= 0; i--) {
      const slotI = this.domains[xi][i];
      let satisfiesConstraint = false;

      const originalAssignment = this.assignment[xi];
      this.assignment[xi] = slotI;
      const consistentWithCurrent = this.isConsistent(xi, slotI, [1]);

      if (consistentWithCurrent) {
        for (const slotJ of this.domains[xj]) {
          const savedXj = this.assignment[xj];

          this.assignment[xj] = slotJ;

          if (this.isConsistent(xj, slotJ, [1])) {
            satisfiesConstraint = true;
          }

          if (savedXj) {
            this.assignment[xj] = savedXj;
          } else {
            delete this.assignment[xj];
          }

          if (satisfiesConstraint) break;
        }
      }

      if (originalAssignment) {
        this.assignment[xi] = originalAssignment;
      } else {
        delete this.assignment[xi];
      }

      if (!satisfiesConstraint) {
        this.domains[xi].splice(i, 1);
        removed = true;
      }
    }

    return removed;
  }

  selectVariableMRV() {
    let minVar = null;
    let minDomainSize = Infinity;

    for (const course of this.courses) {
      if (course.id in this.assignment) continue;

      const domainSize = this.domains[course.id].length;
      if (domainSize < minDomainSize) {
        minDomainSize = domainSize;
        minVar = course.id;
      }
    }

    return minVar;
  }

  selectVariableInOrder() {
    for (const course of this.courses) {
      if (!(course.id in this.assignment)) {
        return course.id;
      }
    }
    return null;
  }

  backtrackingSearch(useAC3 = false, useMRV = false, trackSteps = false) {
    this.initializeDomains();
    this.assignment = {};
    this.stats = { backtrackCalls: 0, failedAssignments: 0 };

    if (trackSteps) {
      this.steps = {};
      for (let i = 1; i <= this.groupCount; i++) {
        this.steps[`G${i}`] = [];
      }
    }

    if (useAC3) {
      if (!this.ac3()) {
        return null;
      }
    }

    return this.backtrack(useAC3, useMRV, trackSteps);
  }

  backtrack(useAC3 = false, useMRV = false, trackSteps = false) {
    this.stats.backtrackCalls++;

    if (Object.keys(this.assignment).length === this.courses.length) {
      return this.assignment;
    }

    const courseId = useMRV
      ? this.selectVariableMRV()
      : this.selectVariableInOrder();

    for (const timeSlot of this.domains[courseId]) {
      if (this.isConsistent(courseId, timeSlot)) {
        this.assignment[courseId] = timeSlot;

        if (trackSteps) {
          const course = this.courses.find((c) => c.id === courseId);
          this.steps[course.groupId].push({
            courseId,
            course: {
              name: course.name,
              type: course.type,
              teacher: course.teacher,
            },
            timeSlot: { ...timeSlot },
            assignment: this.createAssignmentSnapshot(),
          });
        }

        const savedDomains = JSON.parse(JSON.stringify(this.domains));

        let failure = false;
        if (useAC3) {
          for (const otherId in this.domains) {
            if (otherId !== courseId.toString() && !this.assignment[otherId]) {
              const otherCourse = this.courses.find(
                (c) => c.id === parseInt(otherId)
              );
              const thisCourse = this.courses.find((c) => c.id === courseId);

              if (
                otherCourse.groupId === thisCourse.groupId ||
                otherCourse.teacher === thisCourse.teacher ||
                otherCourse.name === thisCourse.name
              ) {
                this.domains[otherId] = this.domains[otherId].filter((slot) =>
                  this.areConsistent(thisCourse, timeSlot, otherCourse, slot)
                );

                if (this.domains[otherId].length === 0) {
                  failure = true;
                  break;
                }
              }
            }
          }
        }

        if (!failure) {
          const result = this.backtrack(useAC3, useMRV, trackSteps);
          if (result !== null) {
            return result;
          }
        }

        delete this.assignment[courseId];
        this.domains = savedDomains;
        this.stats.failedAssignments++;
      }
    }

    return null;
  }

  createAssignmentSnapshot() {
    const snapshot = {};
    for (let i = 1; i <= this.totalGroups; i++) {
      const groupId = `G${i}`;
      snapshot[groupId] = {
        Sunday: {
          "8:00": null,
          "9:30": null,
          "11:00": null,
          "12:30": null,
          "14:00": null,
        },
        Monday: {
          "8:00": null,
          "9:30": null,
          "11:00": null,
          "12:30": null,
          "14:00": null,
        },
        Tuesday: { "8:00": null, "9:30": null, "11:00": null },
        Wednesday: {
          "8:00": null,
          "9:30": null,
          "11:00": null,
          "12:30": null,
          "14:00": null,
        },
        Thursday: {
          "8:00": null,
          "9:30": null,
          "11:00": null,
          "12:30": null,
          "14:00": null,
        },
      };
    }

    Object.entries(this.assignment).forEach(([courseId, timeSlot]) => {
      const course = this.courses.find((c) => c.id === parseInt(courseId));
      snapshot[course.groupId][timeSlot.day][timeSlot.hour] = {
        name: course.name,
        type: course.type,
        teacher: course.teacher,
      };
    });

    return snapshot;
  }

  formatResult() {
    if (!this.assignment || Object.keys(this.assignment).length === 0) {
      return null;
    }

    const result = {};

    for (let i = 1; i <= this.totalGroups; i++) {
      const groupId = `G${i}`;
      result[groupId] = {
        Sunday: {
          "8:00": null,
          "9:30": null,
          "11:00": null,
          "12:30": null,
          "14:00": null,
        },
        Monday: {
          "8:00": null,
          "9:30": null,
          "11:00": null,
          "12:30": null,
          "14:00": null,
        },
        Tuesday: {
          "8:00": null,
          "9:30": null,
          "11:00": null,
          "12:30": null,
          "14:00": null,
        },
        Wednesday: {
          "8:00": null,
          "9:30": null,
          "11:00": null,
          "12:30": null,
          "14:00": null,
        },
        Thursday: {
          "8:00": null,
          "9:30": null,
          "11:00": null,
          "12:30": null,
          "14:00": null,
        },
      };
    }

    Object.entries(this.assignment).forEach(([courseId, timeSlot]) => {
      const course = this.courses.find((c) => c.id === parseInt(courseId));
      result[course.groupId][timeSlot.day][timeSlot.hour] = {
        name: course.name,
        type: course.type,
        teacher: course.teacher,
      };
    });

    return result;
  }

  solve(useAC3 = false, useMRV = false, trackSteps = false) {
    const startTime = performance.now();

    const solution = this.backtrackingSearch(useAC3, useMRV, trackSteps);

    const endTime = performance.now();
    const timeTaken = (endTime - startTime).toFixed(2);

    if (solution) {
      const result = {
        success: true,
        timetable: this.formatResult(),
        stats: {
          ...this.stats,
          timeTaken: `${timeTaken} ms`,
        },
      };

      if (trackSteps) {
        result.steps = {};

        for (let i = 1; i <= this.totalGroups; i++) {
          const groupId = `G${i}`;

          if (i <= this.groupCount && this.steps[groupId]) {
            result.steps[groupId] = this.steps[groupId];
          } else {
            result.steps[groupId] = [];
          }
        }
      }

      return result;
    } else {
      const result = {
        success: false,
        message: "No solution found",
        stats: {
          ...this.stats,
          timeTaken: `${timeTaken} ms`,
        },
      };

      if (trackSteps) {
        result.steps = {};

        for (let i = 1; i <= this.totalGroups; i++) {
          const groupId = `G${i}`;

          if (i <= this.groupCount && this.steps[groupId]) {
            result.steps[groupId] = this.steps[groupId];
          } else {
            result.steps[groupId] = [];
          }
        }
      }

      return result;
    }
  }
}

export default CSPSolver;
