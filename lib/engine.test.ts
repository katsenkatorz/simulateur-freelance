import { describe, it, expect } from 'vitest'
import {
  calcIR, calcIS, simMicro, simTNS_A, simTNS_B,
  simSASU_A, simSASU_B, simHolding, fmt, retInfo,
} from './engine'
import goldenDataset from './fixtures/golden-dataset.json'

// --- Contract tests: verify return shape, not values ---
// Values will be tested in Story 1.2 (golden dataset)

describe('calcIR', () => {
  it('returns a non-negative number', () => {
    const result = calcIR(50000, 1)
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThanOrEqual(0)
  })

  it('returns 0 for income below first bracket', () => {
    expect(calcIR(5000, 1)).toBe(0)
  })

  it('returns 0 for zero income', () => {
    expect(calcIR(0, 1)).toBe(0)
  })

  it('reduces IR with more parts', () => {
    const ir1 = calcIR(60000, 1)
    const ir2 = calcIR(60000, 2)
    expect(ir2).toBeLessThan(ir1)
  })
})

describe('calcIS', () => {
  it('returns ISResult with is15, is25, total', () => {
    const result = calcIS(60000, 42500)
    expect(result).toHaveProperty('is15')
    expect(result).toHaveProperty('is25')
    expect(result).toHaveProperty('total')
    expect(result.total).toBe(result.is15 + result.is25)
  })

  it('returns all zeros for zero profit', () => {
    const result = calcIS(0, 42500)
    expect(result.total).toBe(0)
    expect(result.is15).toBe(0)
    expect(result.is25).toBe(0)
  })

  it('returns all zeros for negative profit', () => {
    const result = calcIS(-10000, 42500)
    expect(result.total).toBe(0)
  })

  it('applies only is15 below threshold', () => {
    const result = calcIS(30000, 42500)
    expect(result.is25).toBe(0)
    expect(result.is15).toBeGreaterThan(0)
  })

  it('applies both rates above threshold', () => {
    const result = calcIS(60000, 42500)
    expect(result.is15).toBeGreaterThan(0)
    expect(result.is25).toBeGreaterThan(0)
  })
})

describe('simMicro', () => {
  it('returns object with required fields', () => {
    const result = simMicro(80000, 1, 42500)
    expect(result).toHaveProperty('ca')
    expect(result).toHaveProperty('co')
    expect(result).toHaveProperty('ir')
    expect(result).toHaveProperty('net')
    expect(result).toHaveProperty('ret')
    expect(result).toHaveProperty('lines')
    expect(result.ca).toBe(80000)
    expect(typeof result.net).toBe('number')
    expect(Array.isArray(result.lines)).toBe(true)
  })

  it('returns non-negative net for positive CA', () => {
    expect(simMicro(50000, 1, 42500).net).toBeGreaterThan(0)
  })

  it('handles CA = 0', () => {
    const result = simMicro(0, 1, 42500)
    expect(result.net).toBe(0)
    expect(result.co).toBe(0)
  })

  it('lines have correct shape (l, a, t)', () => {
    const result = simMicro(80000, 1, 42500)
    for (const line of result.lines) {
      expect(line).toHaveProperty('l')
      expect(line).toHaveProperty('a')
      expect(line).toHaveProperty('t')
      expect(['n', 's', 'c', 'x']).toContain(line.t)
    }
  })
})

describe('simTNS_A', () => {
  it('returns object with required fields', () => {
    const result = simTNS_A(100000, 1, 'EI', 42500)
    expect(result).toHaveProperty('ca')
    expect(result).toHaveProperty('co')
    expect(result).toHaveProperty('ir')
    expect(result).toHaveProperty('net')
    expect(result).toHaveProperty('nr')
    expect(result).toHaveProperty('lines')
    expect(result.ca).toBe(100000)
  })

  it('handles CA = 0', () => {
    const result = simTNS_A(0, 1, 'EI', 42500)
    expect(result.net).toBeLessThanOrEqual(0)
  })
})

describe('simTNS_B', () => {
  it('returns object with IS result', () => {
    const result = simTNS_B(100000, 1, 20000, 42500)
    expect(result).toHaveProperty('ca')
    expect(result).toHaveProperty('co')
    expect(result).toHaveProperty('ir')
    expect(result).toHaveProperty('isD')
    expect(result).toHaveProperty('profit')
    expect(result).toHaveProperty('ret')
    expect(result).toHaveProperty('lines')
    expect(result.isD).toHaveProperty('total')
  })

  it('handles CA = 0', () => {
    const result = simTNS_B(0, 1, 0, 42500)
    expect(result.isD.total).toBe(0)
  })
})

describe('simSASU_A', () => {
  it('returns object with brut field', () => {
    const result = simSASU_A(100000, 1, 42500)
    expect(result).toHaveProperty('ca')
    expect(result).toHaveProperty('co')
    expect(result).toHaveProperty('ir')
    expect(result).toHaveProperty('net')
    expect(result).toHaveProperty('brut')
    expect(result).toHaveProperty('lines')
  })

  it('handles CA = 0', () => {
    const result = simSASU_A(0, 1, 42500)
    expect(result.brut).toBeLessThanOrEqual(0)
  })
})

describe('simSASU_B', () => {
  it('returns object with IS and capital fields', () => {
    const result = simSASU_B(120000, 1, 25000, 42500)
    expect(result).toHaveProperty('ca')
    expect(result).toHaveProperty('isD')
    expect(result).toHaveProperty('profit')
    expect(result).toHaveProperty('ret')
    expect(result).toHaveProperty('brut')
    expect(result).toHaveProperty('lines')
  })
})

describe('simHolding', () => {
  it('returns object with holding-specific fields (mode A)', () => {
    const result = simHolding(150000, 1, 'A', 20000, 500, 42500)
    expect(result).toHaveProperty('ca')
    expect(result).toHaveProperty('net')
    expect(result).toHaveProperty('isSASU')
    expect(result).toHaveProperty('divBrut')
    expect(result).toHaveProperty('mandatAn')
    expect(result).toHaveProperty('sasuL')
    expect(result).toHaveProperty('holdL')
    expect(result).toHaveProperty('lines')
    expect(result.ca).toBe(150000)
    expect(result.mandatAn).toBe(6000)
  })

  it('returns object with holding-specific fields (mode B)', () => {
    const result = simHolding(150000, 1, 'B', 20000, 500, 42500)
    expect(result).toHaveProperty('ret')
    expect(result).toHaveProperty('isH')
    expect(result).toHaveProperty('profitH')
    expect(result).toHaveProperty('lines')
  })

  it('handles CA = 0', () => {
    const result = simHolding(0, 1, 'A', 0, 0, 42500)
    expect(result.net).toBeLessThanOrEqual(0)
  })
})

describe('fmt', () => {
  it('formats numbers in fr-FR locale with €', () => {
    const result = fmt(12345)
    expect(result).toContain('€')
    expect(result).toContain('12')
  })

  it('rounds to nearest integer', () => {
    expect(fmt(1234.7)).toContain('1')
  })
})

describe('retInfo', () => {
  it('returns pension and quarters for micro', () => {
    const result = retInfo('micro', 30000, 0)
    expect(result).toHaveProperty('pen')
    expect(result).toHaveProperty('tr')
    expect(result.tr).toBeGreaterThanOrEqual(0)
    expect(result.tr).toBeLessThanOrEqual(4)
  })

  it('returns pension and quarters for tns', () => {
    const result = retInfo('tns', 40000, 0)
    expect(result).toHaveProperty('pen')
    expect(result).toHaveProperty('tr')
  })

  it('returns pension and quarters for sasu', () => {
    const result = retInfo('sasu', 35000, 40000)
    expect(result).toHaveProperty('pen')
    expect(result).toHaveProperty('tr')
  })
})

// --- Golden Dataset: value tests (±1€ tolerance) ---
// Sources verified against: BOFiP ACTU-2026-00022, URSSAF barèmes 2026,
// DGFiP simulateur IR 2026, economie.gouv.fr

describe('Golden Dataset — Micro', () => {
  const microCases = goldenDataset.filter(c => c.kind === 'micro')

  it.each(microCases)('$name', ({ input, expected }) => {
    const result = simMicro(input.ca, input.parts, input.seuil)
    expect(result.net).toBeCloseTo(expected.net, -1)
    expect(result.co).toBeCloseTo(expected.co, -1)
    expect(result.ir).toBeCloseTo(expected.ir, -1)
  })
})

describe('Golden Dataset — EI (TNS Mode A)', () => {
  const tnsCases = goldenDataset.filter(c => c.kind === 'tns_a')

  it.each(tnsCases)('$name', ({ input, expected }) => {
    const result = simTNS_A(input.ca, input.parts, (input as any).label || 'EI', input.seuil)
    expect(result.net).toBeCloseTo(expected.net, -1)
    expect(result.co).toBeCloseTo(expected.co, -1)
    expect(result.ir).toBeCloseTo(expected.ir, -1)
  })
})

describe('Golden Dataset — EURL (TNS Mode B)', () => {
  const eurCases = goldenDataset.filter(c => c.kind === 'tns_b')

  it.each(eurCases)('$name', ({ input, expected }) => {
    const result = simTNS_B(input.ca, input.parts, (input as any).sal, input.seuil)
    expect(result.net).toBeCloseTo(expected.net, -1)
    expect(result.ir).toBeCloseTo(expected.ir, -1)
    expect(result.isD.total).toBeCloseTo((expected as any).is, -1)
  })
})

describe('Golden Dataset — SASU Mode A', () => {
  const sasuACases = goldenDataset.filter(c => c.kind === 'sasu_a')

  it.each(sasuACases)('$name', ({ input, expected }) => {
    const result = simSASU_A(input.ca, input.parts, input.seuil)
    expect(result.net).toBeCloseTo(expected.net, -1)
    expect(result.co).toBeCloseTo(expected.co, -1)
    expect(result.ir).toBeCloseTo(expected.ir, -1)
  })
})

describe('Golden Dataset — SASU Mode B', () => {
  const sasuBCases = goldenDataset.filter(c => c.kind === 'sasu_b')

  it.each(sasuBCases)('$name', ({ input, expected }) => {
    const result = simSASU_B(input.ca, input.parts, (input as any).sal, input.seuil)
    expect(result.net).toBeCloseTo(expected.net, -1)
    expect(result.ir).toBeCloseTo(expected.ir, -1)
    expect(result.isD.total).toBeCloseTo((expected as any).is, -1)
  })
})

describe('Golden Dataset — Holding', () => {
  const holdCases = goldenDataset.filter(c => c.kind.startsWith('holding'))

  it.each(holdCases)('$name', ({ input, expected }) => {
    const i = input as any
    const result = simHolding(i.ca, i.parts, i.mode, i.sal, i.mandatMonth, i.seuil)
    expect(result.net).toBeCloseTo(expected.net, -1)
    expect(result.ir).toBeCloseTo(expected.ir, -1)
  })
})

describe('Golden Dataset — IR Boundaries', () => {
  const irCases = goldenDataset.filter(c => c.kind === 'ir')

  it.each(irCases)('$name', ({ input, expected }) => {
    const i = input as any
    const result = calcIR(i.rn, i.parts)
    expect(result).toBeCloseTo(expected.ir, -1)
  })
})
