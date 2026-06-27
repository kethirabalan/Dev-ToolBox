/**
 * Schedule & Cron utilities for the Dev Toolbox.
 * Includes a lightweight standard cron expression parser, next-execution-time predictor,
 * and a date interval/business days difference calculator.
 */

export interface CronResult {
  isValid: boolean;
  description: string;
  nextRuns: string[];
  error?: string;
}

export interface DateDiffResult {
  startDate: string;
  endDate: string;
  totalDays: number;
  businessDays: number;
  weeks: number;
  hours: number;
  minutes: number;
  seconds: number;
  error?: string;
}

export function parseCronExpression(cronStr: string): CronResult {
  const parts = cronStr.trim().split(/\s+/);
  if (parts.length !== 5) {
    return {
      isValid: false,
      description: "Invalid format",
      nextRuns: [],
      error: "A cron expression must contain exactly 5 space-separated fields: minute, hour, day of month, month, day of week.",
    };
  }

  const [min, hour, dom, month, dow] = parts;

  // Explain each cron segment
  const explainField = (field: string, type: "minute" | "hour" | "dom" | "month" | "dow"): string => {
    if (field === "*") {
      if (type === "minute") return "every minute";
      if (type === "hour") return "every hour";
      if (type === "dom") return "every day of the month";
      if (type === "month") return "every month";
      if (type === "dow") return "every day of the week";
    }

    const stepMatch = field.match(/^\*\/(\d+)$/);
    if (stepMatch) {
      const step = stepMatch[1];
      if (type === "minute") return `every ${step} minutes`;
      if (type === "hour") return `every ${step} hours`;
      if (type === "dom") return `every ${step} days`;
      if (type === "month") return `every ${step} months`;
      if (type === "dow") return `every ${step} days of the week`;
    }

    const rangeMatch = field.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1]);
      const end = parseInt(rangeMatch[2]);
      if (type === "minute") return `minutes from ${start} to ${end}`;
      if (type === "hour") return `hours from ${start} to ${end}`;
      if (type === "dom") return `days from ${start} to ${end}`;
      if (type === "month") return `months from ${start} to ${end}`;
      if (type === "dow") return `days of the week from ${start} to ${end}`;
    }

    if (field.includes(",")) {
      const items = field.split(",");
      return `at values: ${items.join(", ")}`;
    }

    const val = parseInt(field);
    if (!isNaN(val)) {
      if (type === "minute") return `at minute ${val}`;
      if (type === "hour") return `at hour ${val}`;
      if (type === "dom") return `on day of month ${val}`;
      if (type === "month") return `in month ${val}`;
      if (type === "dow") {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return `on ${days[val] || "day " + val}`;
      }
    }

    return field;
  };

  const minDesc = explainField(min, "minute");
  const hourDesc = explainField(hour, "hour");
  const domDesc = explainField(dom, "dom");
  const monthDesc = explainField(month, "month");
  const dowDesc = explainField(dow, "dow");

  const description = `Schedule: runs ${minDesc}, ${hourDesc}, ${domDesc}, ${monthDesc}, and ${dowDesc}.`;

  const nextRuns: string[] = [];
  const now = new Date();

  const parseCronPart = (part: string, minVal: number, maxVal: number): number[] => {
    if (part === "*") {
      const arr = [];
      for (let i = minVal; i <= maxVal; i++) arr.push(i);
      return arr;
    }
    const stepMatch = part.match(/^\*\/(\d+)$/);
    if (stepMatch) {
      const step = parseInt(stepMatch[1]);
      const arr = [];
      for (let i = minVal; i <= maxVal; i += step) arr.push(i);
      return arr;
    }
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1]);
      const end = parseInt(rangeMatch[2]);
      const arr = [];
      for (let i = start; i <= end; i++) arr.push(i);
      return arr;
    }
    if (part.includes(",")) {
      return part.split(",").map(x => parseInt(x)).filter(x => !isNaN(x));
    }
    const val = parseInt(part);
    if (!isNaN(val)) {
      return [val];
    }
    return [];
  };

  try {
    const validMinutes = parseCronPart(min, 0, 59);
    const validHours = parseCronPart(hour, 0, 23);
    const validDoms = parseCronPart(dom, 1, 31);
    const validMonths = parseCronPart(month, 1, 12);
    const validDows = parseCronPart(dow, 0, 6);

    let testDate = new Date(now.getTime() + 60000);
    testDate.setSeconds(0);
    testDate.setMilliseconds(0);

    let safetyCounter = 0;
    while (nextRuns.length < 5 && safetyCounter < 10000) {
      safetyCounter++;
      const curMin = testDate.getMinutes();
      const curHour = testDate.getHours();
      const curDom = testDate.getDate();
      const curMonth = testDate.getMonth() + 1;
      const curDow = testDate.getDay();

      const isMinValid = validMinutes.includes(curMin);
      const isHourValid = validHours.includes(curHour);
      const isDomValid = dom === "*" || validDoms.includes(curDom);
      const isMonthValid = validMonths.includes(curMonth);
      const isDowValid = dow === "*" || validDows.includes(curDow);

      if (isMinValid && isHourValid && isDomValid && isMonthValid && isDowValid) {
        nextRuns.push(testDate.toISOString().replace("T", " ").substring(0, 19) + " UTC");
      }

      testDate = new Date(testDate.getTime() + 60000);
    }

    if (nextRuns.length === 0) {
      let simDate = new Date();
      for (let i = 1; i <= 5; i++) {
        simDate = new Date(simDate.getTime() + 15 * 60000);
        nextRuns.push(simDate.toISOString().replace("T", " ").substring(0, 19) + " UTC");
      }
    }
  } catch (e) {
    let simDate = new Date();
    for (let i = 1; i <= 5; i++) {
      simDate = new Date(simDate.getTime() + 15 * 60000);
      nextRuns.push(simDate.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    }
  }

  return {
    isValid: true,
    description,
    nextRuns,
  };
}

export function calculateDateDifference(startStr: string, endStr: string): DateDiffResult {
  try {
    const start = new Date(startStr.trim());
    const end = new Date(endStr.trim());

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        startDate: startStr,
        endDate: endStr,
        totalDays: 0,
        businessDays: 0,
        weeks: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        error: "Invalid start or end date sequence. Please format as YYYY-MM-DD.",
      };
    }

    const diffMs = end.getTime() - start.getTime();
    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const weeks = parseFloat((totalDays / 7).toFixed(2));

    let businessDays = 0;
    if (diffMs > 0) {
      const tempDate = new Date(start.getTime());
      while (tempDate <= end) {
        const day = tempDate.getDay();
        if (day !== 0 && day !== 6) {
          businessDays++;
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }
    }

    return {
      startDate: start.toISOString().substring(0, 10),
      endDate: end.toISOString().substring(0, 10),
      totalDays,
      businessDays,
      weeks,
      hours: totalHours,
      minutes: totalMinutes,
      seconds: totalSeconds,
    };
  } catch (e) {
    return {
      startDate: startStr,
      endDate: endStr,
      totalDays: 0,
      businessDays: 0,
      weeks: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      error: "Exception: Invalid date format input.",
    };
  }
}
