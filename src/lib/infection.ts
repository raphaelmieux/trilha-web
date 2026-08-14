/**
 * Outbreak model for the ThreatLab.
 *
 * Requirements AP034-4.2 and AP034-4.3 ask the student to *explain* why an
 * antivirus has to be kept up to date, and how one unprotected machine spreads
 * an infection to everyone who shares files with it. Explanations are exactly
 * what a multiple-choice question cannot check, and telling a twelve-year-old
 * "keep it updated" is advice, not understanding.
 *
 * So the lab runs the club's computers instead. The student sets how old the
 * signature file is and which habits the club has, and watches thirty days go
 * by. The point lands on its own: with fresh signatures the outbreak dies at one
 * machine, and with a six-month-old file the same habits take the whole club.
 *
 * The model is deterministic — no randomness anywhere. Two students with the
 * same settings see the same curve, a leader can reproduce what a student
 * reports, and every rule below can be tested.
 */

export interface ClubSetup {
  /** Computers and phones that share files at the club. */
  devices: number;
  /** Days since the antivirus last downloaded new signatures. */
  signatureAgeDays: number;
  /** Pen drives passed around to swap photos and hymn slides. */
  sharesRemovableMedia: boolean;
  /** Attachments opened without checking who sent them. */
  opensUnknownAttachments: boolean;
  /** System and browser kept current, closing known holes. */
  systemUpdated: boolean;
}

export interface DayState {
  day: number;
  /** Devices infected at the end of this day. */
  infected: number;
  /** Infection attempts the antivirus has stopped so far. */
  blocked: number;
}

/**
 * How much of today's malware a signature file of a given age still recognises.
 *
 * Antivirus signatures name threats that were already known when the file was
 * written; everything created since is invisible to it. Halving every 90 days
 * is a deliberately simple stand-in for that, and it produces the numbers that
 * matter: current signatures catch nearly everything, a file six months old
 * catches about a quarter, and one never updated catches almost nothing.
 */
export function detectionRate(signatureAgeDays: number): number {
  if (signatureAgeDays < 0) return 0.98;
  return 0.98 * Math.pow(0.5, signatureAgeDays / 90);
}

/**
 * How many other devices one infected device reaches per day.
 *
 * Each habit is a channel. Removable media is the heaviest because a pen drive
 * carries the file straight past the network entirely; an unpatched system
 * leaves a channel open even for a club that does everything else right, which
 * is the part students find surprising.
 */
export function contactsPerDay(setup: ClubSetup): number {
  let contacts = setup.systemUpdated ? 0.08 : 0.35;
  if (setup.sharesRemovableMedia) contacts += 1.2;
  if (setup.opensUnknownAttachments) contacts += 0.9;
  return contacts;
}

/**
 * Runs the outbreak from a single infected device.
 * Returns one entry per day, starting at day 0 with one infection.
 */
export function simulateOutbreak(setup: ClubSetup, days = 30): DayState[] {
  const total = Math.max(1, Math.floor(setup.devices));
  const escapes = 1 - detectionRate(setup.signatureAgeDays);
  const contacts = contactsPerDay(setup);

  let infected = 1;
  let blocked = 0;
  const history: DayState[] = [{ day: 0, infected: 1, blocked: 0 }];

  for (let day = 1; day <= days; day++) {
    const susceptible = total - infected;
    const attempts = infected * contacts;
    const reaching = Math.min(attempts, susceptible);
    const newlyInfected = reaching * escapes;
    blocked += reaching - newlyInfected;
    infected = Math.min(total, infected + newlyInfected);
    history.push({ day, infected: Math.round(infected), blocked: Math.round(blocked) });
  }
  return history;
}

/** Convenience: how many devices are infected when the simulation ends. */
export function finalInfected(setup: ClubSetup, days = 30): number {
  const history = simulateOutbreak(setup, days);
  return history[history.length - 1].infected;
}

/** True when the outbreak never left the machine it started on. */
export function isContained(setup: ClubSetup, days = 30): boolean {
  return finalInfected(setup, days) <= 1;
}
