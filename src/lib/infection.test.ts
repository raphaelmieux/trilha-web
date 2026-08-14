import { describe, it, expect } from 'vitest';
import {
  detectionRate, contactsPerDay, simulateOutbreak, finalInfected, isContained,
  type ClubSetup,
} from './infection';

const club = (over: Partial<ClubSetup> = {}): ClubSetup => ({
  devices: 12,
  signatureAgeDays: 0,
  sharesRemovableMedia: false,
  opensUnknownAttachments: false,
  systemUpdated: true,
  ...over,
});

describe('detectionRate', () => {
  it('catches nearly everything with fresh signatures', () => {
    expect(detectionRate(0)).toBeCloseTo(0.98, 5);
  });

  it('halves every ninety days', () => {
    expect(detectionRate(90)).toBeCloseTo(0.49, 5);
    expect(detectionRate(180)).toBeCloseTo(0.245, 5);
  });

  it('is nearly blind after a year without updating', () => {
    expect(detectionRate(365)).toBeLessThan(0.07);
  });

  it('never rises with age', () => {
    for (let d = 1; d <= 400; d++) {
      expect(detectionRate(d)).toBeLessThanOrEqual(detectionRate(d - 1));
    }
  });

  it('never reaches 1, because no antivirus catches everything', () => {
    expect(detectionRate(0)).toBeLessThan(1);
  });
});

describe('contactsPerDay', () => {
  it('leaves a small channel open even for a careful club', () => {
    // Not zero: an updated system still has holes nobody knows about yet.
    expect(contactsPerDay(club())).toBeGreaterThan(0);
  });

  it('rises when the system is not kept current', () => {
    expect(contactsPerDay(club({ systemUpdated: false })))
      .toBeGreaterThan(contactsPerDay(club({ systemUpdated: true })));
  });

  it('makes shared pen drives the heaviest single habit', () => {
    const media = contactsPerDay(club({ sharesRemovableMedia: true }));
    const mail = contactsPerDay(club({ opensUnknownAttachments: true }));
    expect(media).toBeGreaterThan(mail);
  });

  it('adds the channels rather than replacing them', () => {
    const both = contactsPerDay(club({ sharesRemovableMedia: true, opensUnknownAttachments: true }));
    const base = contactsPerDay(club());
    expect(both).toBeCloseTo(base + 1.2 + 0.9, 5);
  });
});

describe('simulateOutbreak', () => {
  it('starts with exactly one infected device on day zero', () => {
    const h = simulateOutbreak(club());
    expect(h[0]).toEqual({ day: 0, infected: 1, blocked: 0 });
  });

  it('returns one entry per day plus day zero', () => {
    expect(simulateOutbreak(club(), 30)).toHaveLength(31);
  });

  it('never infects more devices than the club owns', () => {
    const h = simulateOutbreak(club({ devices: 5, signatureAgeDays: 3650, sharesRemovableMedia: true }), 60);
    expect(Math.max(...h.map(d => d.infected))).toBeLessThanOrEqual(5);
  });

  it('never lets the count go down — this models spread, not recovery', () => {
    const h = simulateOutbreak(club({ signatureAgeDays: 120, sharesRemovableMedia: true }));
    for (let i = 1; i < h.length; i++) {
      expect(h[i].infected).toBeGreaterThanOrEqual(h[i - 1].infected);
    }
  });

  it('is deterministic: the same settings give the same curve', () => {
    const setup = club({ signatureAgeDays: 60, opensUnknownAttachments: true });
    expect(simulateOutbreak(setup)).toEqual(simulateOutbreak(setup));
  });

  it('counts blocked attempts when the antivirus is doing its job', () => {
    const h = simulateOutbreak(club({ sharesRemovableMedia: true }));
    expect(h[h.length - 1].blocked).toBeGreaterThan(0);
  });
});

describe('the lessons the lab is built to teach', () => {
  it('contains the outbreak when signatures are fresh and nothing is shared', () => {
    expect(isContained(club())).toBe(true);
  });

  it('loses the whole club to the same habits once signatures are six months old', () => {
    const careless = club({ signatureAgeDays: 180, sharesRemovableMedia: true, opensUnknownAttachments: true });
    expect(finalInfected(careless)).toBe(12);
  });

  it('shows updating the antivirus alone changing the outcome', () => {
    // Identical habits, only the signature age differs. This is requirement
    // AP034-4.2 made visible: the update *is* the difference.
    const habits = { sharesRemovableMedia: true, opensUnknownAttachments: true };
    const stale = finalInfected(club({ ...habits, signatureAgeDays: 365 }));
    const fresh = finalInfected(club({ ...habits, signatureAgeDays: 0 }));
    expect(stale).toBe(12);
    expect(fresh).toBeLessThan(stale);
  });

  it('shows one shared pen drive carrying the infection past a patched system', () => {
    // AP034-4.3: the unprotected machine is everyone's problem.
    const patchedButSharing = club({ signatureAgeDays: 200, sharesRemovableMedia: true });
    expect(finalInfected(patchedButSharing)).toBeGreaterThan(6);
  });

  it('leaves a careful club exposed to nothing it can control', () => {
    expect(finalInfected(club({ signatureAgeDays: 0 }), 30)).toBe(1);
  });
});
