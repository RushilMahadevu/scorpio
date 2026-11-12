describe("Waypoints Plan Restrictions", () => {
  const mockWaypoints = [
    { id: "wp-1", title: "1D Kinematics", visibility: "global" },
    { id: "wp-2", title: "Newton's Laws", visibility: "global" },
    { id: "wp-3", title: "Energy & Work", visibility: "global" },
    { id: "wp-4", title: "Rotational Dynamics", visibility: "global" },
    { id: "wp-5", title: "Thermodynamics", visibility: "global" },
  ];

  function isWaypointLocked(
    waypointId: string,
    index: number,
    starterIds: string[],
    isFreePlan: boolean,
    activeTab: string
  ): boolean {
    if (!isFreePlan) return false;
    if (activeTab === "network") return true;
    if (starterIds.length > 0) {
      return !starterIds.includes(waypointId);
    }
    return index >= 3;
  }

  test("free plan unlocks the first 3 starter waypoints and locks index 3+", () => {
    const starterIds = mockWaypoints.slice(0, 3).map(w => w.id);
    const isFreePlan = true;
    const activeTab = "global";

    expect(isWaypointLocked("wp-1", 0, starterIds, isFreePlan, activeTab)).toBe(false);
    expect(isWaypointLocked("wp-2", 1, starterIds, isFreePlan, activeTab)).toBe(false);
    expect(isWaypointLocked("wp-3", 2, starterIds, isFreePlan, activeTab)).toBe(false);

    expect(isWaypointLocked("wp-4", 3, starterIds, isFreePlan, activeTab)).toBe(true);
    expect(isWaypointLocked("wp-5", 4, starterIds, isFreePlan, activeTab)).toBe(true);
  });

  test("department plan unlocks all waypoints without limitation", () => {
    const starterIds = mockWaypoints.slice(0, 3).map(w => w.id);
    const isFreePlan = false;
    const activeTab = "global";

    mockWaypoints.forEach((wp, idx) => {
      expect(isWaypointLocked(wp.id, idx, starterIds, isFreePlan, activeTab)).toBe(false);
    });
  });

  test("free plan locks all waypoints on the department network tab", () => {
    const starterIds = mockWaypoints.slice(0, 3).map(w => w.id);
    const isFreePlan = true;
    const activeTab = "network";

    expect(isWaypointLocked("wp-1", 0, starterIds, isFreePlan, activeTab)).toBe(true);
    expect(isWaypointLocked("wp-4", 3, starterIds, isFreePlan, activeTab)).toBe(true);
  });
});
