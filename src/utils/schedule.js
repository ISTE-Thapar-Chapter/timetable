import timetable from "@/assets/timetable.json" with { type: "json" };
// import timetable from "../assets/timetable.json" with { type: "json" };

export function batchScheduleData(batch = "1A92") {
    if (!batch) return {};
    const upperBatch = batch.toUpperCase();
    return timetable[upperBatch] || timetable[batch] || {};
}

export function batchesList() {
    return Object.keys(timetable).filter((batch) => batch);
}

export function getBatchesData(batches = []) {
    const invalid = batches.some((batch) => {
        if (!batch) return true;
        const upper = batch.toUpperCase();
        return !timetable[upper] && !timetable[batch];
    });

    if (invalid) {
        throw new Error("Invalid batch name(s) provided.");
    }
    else {
        return batches.reduce((acc, batch) => {
            const upper = batch.toUpperCase();
            acc[batch] = timetable[upper] || timetable[batch] || {};
            return acc;
        }, {});
    }
}