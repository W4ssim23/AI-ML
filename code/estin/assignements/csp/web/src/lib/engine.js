class CSPSolver {
  constructor(courses, timeSlots, constraints, groupCount = 6) {
    this.courses = this.expandCoursesForGroups(courses, groupCount);
    this.timeSlots = this.generateTimeSlots(timeSlots);
    this.constraints = constraints;
    this.groupCount = groupCount;
    this.assignment = {};
    this.domains = {};
    this.stats = {
      backtrackCalls: 0,
      failedAssignments: 0,
    };
  }

  // Expand courses for multiple groups
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

  // Initialize domain values for each course
  initializeDomains() {
    this.courses.forEach((course) => {
      this.domains[course.id] = [...this.timeSlots];
    });
  }

  // Check if an assignment is consistent with constraints
  isConsistent(courseId, timeSlot) {
    const course = this.courses.find((c) => c.id === courseId);

    // Check hard constraints
    for (const constraint of this.constraints.hardConstraints) {
      if (!constraint.enabled) continue;

      switch (constraint.id) {
        case 1: // Max three successive slots
          if (!this.checkMaxSuccessiveSlots(course, timeSlot)) return false;
          break;
        case 2: // No same course in same slot
          if (!this.checkNoSameCourseInSameSlot(course, timeSlot)) return false;
          break;
        case 3: // Different courses for same group in different slots
          if (!this.checkDifferentCoursesForSameGroup(course, timeSlot))
            return false;
          break;
        case 4: // Tuesday has only three morning slots
          if (
            timeSlot.day === "Tuesday" &&
            (timeSlot.hour === "12:30" || timeSlot.hour === "14:00")
          ) {
            return false;
          }
          break;
      }
    }

    // Check soft constraints if enabled
    for (const constraint of this.constraints.softConstraints) {
      if (!constraint.enabled) continue;

      switch (constraint.id) {
        case 1: // Each teacher max two days
          if (!this.checkTeacherMaxTwoDays(course, timeSlot)) return false;
          break;
      }
    }

    return true;
  }

  // Check if adding this assignment would exceed 3 successive slots for a group
  checkMaxSuccessiveSlots(course, timeSlot) {
    const hours = ["8:00", "9:30", "11:00", "12:30", "14:00"];
    const hourIdx = hours.indexOf(timeSlot.hour);

    // Count consecutive slots before this one for the same group
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

    // Count consecutive slots after this one for the same group
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

    // Check if adding this would exceed 3 consecutive slots
    return consecutiveBefore + consecutiveAfter + 1 <= 3;
  }

  // Check no same course in same slot across all groups
  checkNoSameCourseInSameSlot(course, timeSlot) {
    // Find courses with same name but different types or groups
    const sameCourseDifferentType = this.courses.filter(
      (c) => c.id !== course.id && c.name === course.name
    );

    // Check if any of these courses are assigned to the same time slot
    return !sameCourseDifferentType.some((c) => {
      const assignedSlot = this.assignment[c.id];
      return (
        assignedSlot &&
        assignedSlot.day === timeSlot.day &&
        assignedSlot.hour === timeSlot.hour
      );
    });
  }

  // Check different courses for same group in different slots
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

  // Check if a teacher is available (not teaching another group at the same time)
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

  // Check teacher max two days
  checkTeacherMaxTwoDays(course, timeSlot) {
    const teacherDays = new Set();

    // Add days this teacher is already scheduled for
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

    // If this is a new day for the teacher and they already have 2 days, it's inconsistent
    if (!teacherDays.has(timeSlot.day) && teacherDays.size >= 2) {
      return false;
    }

    return true;
  }

  ac3() {
    const arcs = [];
    const addedArcs = new Set(); // Track arcs to avoid duplicates

    // Generate arcs only between constrained courses
    for (let i = 0; i < this.courses.length; i++) {
      const courseA = this.courses[i];
      for (let j = i + 1; j < this.courses.length; j++) {
        const courseB = this.courses[j];

        // Check if courses share a constraint
        if (
          courseA.groupId === courseB.groupId || // Same group
          courseA.teacher === courseB.teacher || // Same teacher
          courseA.name === courseB.name // Same course name
        ) {
          // Add both directions for the arc
          const arc1 = `${courseA.id},${courseB.id}`;
          const arc2 = `${courseB.id},${courseA.id}`;

          if (!addedArcs.has(arc1)) {
            arcs.push([courseA.id, courseB.id]);
            addedArcs.add(arc1);
          }
          if (!addedArcs.has(arc2)) {
            arcs.push([courseB.id, courseA.id]);
            addedArcs.add(arc2);
          }
        }
      }
    }

    // Rest of the AC3 algorithm remains the same
    while (arcs.length > 0) {
      const [xi, xj] = arcs.shift();
      if (this.removeInconsistentValues(xi, xj)) {
        if (this.domains[xi].length === 0) return false;
        for (const course of this.courses) {
          if (course.id !== xi && course.id !== xj) {
            arcs.push([course.id, xi]);
          }
        }
      }
    }
    return true;
  }

  removeInconsistentValues(xi, xj) {
    let removed = false;
    const courseI = this.courses.find((c) => c.id === xi);
    const courseJ = this.courses.find((c) => c.id === xj);

    // Check each value in domain of xi
    for (let i = this.domains[xi].length - 1; i >= 0; i--) {
      const slotI = this.domains[xi][i];
      let satisfiesConstraint = false;

      // First check if xi=slotI is consistent with current assignments
      const originalAssignment = this.assignment[xi];
      this.assignment[xi] = slotI;
      const consistentWithCurrent = this.isConsistent(xi, slotI);

      // Only proceed if it's consistent with current assignments
      if (consistentWithCurrent) {
        // Check if there's at least one value in domain of xj that's compatible
        for (const slotJ of this.domains[xj]) {
          // Save current assignment to restore later
          const savedXj = this.assignment[xj];

          // Temporarily assign xj to slotJ
          this.assignment[xj] = slotJ;

          // Check if xj=slotJ is consistent with current assignments including xi=slotI
          if (this.isConsistent(xj, slotJ)) {
            satisfiesConstraint = true;
          }

          // Restore original assignment
          if (savedXj) {
            this.assignment[xj] = savedXj;
          } else {
            delete this.assignment[xj];
          }

          if (satisfiesConstraint) break;
        }
      }

      // Restore original xi assignment
      if (originalAssignment) {
        this.assignment[xi] = originalAssignment;
      } else {
        delete this.assignment[xi];
      }

      // If no compatible value found in xj's domain, remove slotI from xi's domain
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

  // Backtracking search algorithm
  backtrackingSearch(useAC3 = false, useMRV = false) {
    this.initializeDomains();
    this.assignment = {};
    this.stats = { backtrackCalls: 0, failedAssignments: 0 };

    // Apply AC3 as preprocessing if enabled
    if (useAC3) {
      if (!this.ac3()) {
        return null; // No solution exists
      }
    }

    return this.backtrack(useAC3, useMRV);
  }

  backtrack(useAC3 = false, useMRV = false) {
    this.stats.backtrackCalls++;

    // Check if assignment is complete
    if (Object.keys(this.assignment).length === this.courses.length) {
      return this.assignment;
    }

    // Select unassigned variable
    const courseId = useMRV
      ? this.selectVariableMRV()
      : this.selectVariableInOrder();

    // Try each value in the domain
    for (const timeSlot of this.domains[courseId]) {
      if (this.isConsistent(courseId, timeSlot)) {
        // Assign value
        this.assignment[courseId] = timeSlot;

        // Make a copy of domains to restore later if needed
        const savedDomains = JSON.parse(JSON.stringify(this.domains));

        // Apply constraint propagation if enabled
        let failure = false;
        if (useAC3) {
          // Update domains based on this assignment
          for (const otherId in this.domains) {
            if (otherId !== courseId.toString()) {
              this.domains[otherId] = this.domains[otherId].filter((slot) => {
                // Temporarily add this assignment
                const originalAssignment = this.assignment[otherId];
                this.assignment[otherId] = slot;

                // Check if consistent
                const consistent = this.isConsistent(parseInt(otherId), slot);

                // Restore original assignment
                if (originalAssignment) {
                  this.assignment[otherId] = originalAssignment;
                } else {
                  delete this.assignment[otherId];
                }

                return consistent;
              });

              // If any domain becomes empty, we need to backtrack
              if (this.domains[otherId].length === 0) {
                failure = true;
                break;
              }
            }
          }
        }

        if (!failure) {
          // Recursive call
          const result = this.backtrack(useAC3, useMRV);
          if (result !== null) {
            return result;
          }
        }

        // If we get here, we need to undo the assignment and restore domains
        delete this.assignment[courseId];
        this.domains = savedDomains;
        this.stats.failedAssignments++;
      }
    }

    return null; // No solution found
  }

  // Format the result into the timetable structure for all groups
  formatResult() {
    if (!this.assignment || Object.keys(this.assignment).length === 0) {
      return null;
    }

    // Create empty timetable structure for all groups
    const result = {};

    for (let i = 1; i <= this.groupCount; i++) {
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

    // Fill in the assignments
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

  // Solve the CSP with selected options
  solve(useAC3 = false, useMRV = false) {
    const startTime = performance.now();

    const solution = this.backtrackingSearch(useAC3, useMRV);

    const endTime = performance.now();
    const timeTaken = (endTime - startTime).toFixed(2);

    if (solution) {
      return {
        success: true,
        timetable: this.formatResult(),
        stats: {
          ...this.stats,
          timeTaken: `${timeTaken} ms`,
        },
      };
    } else {
      return {
        success: false,
        message: "No solution found",
        stats: {
          ...this.stats,
          timeTaken: `${timeTaken} ms`,
        },
      };
    }
  }
}

export default CSPSolver;
