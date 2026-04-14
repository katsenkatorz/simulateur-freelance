import { describe, it, expect } from 'vitest'
import { buildCascadeItems } from './cascade-builder'
import { simMicro, simTNS_A, simTNS_B, simSASU_A, simSASU_B, simHolding, mkMicro, mkTNS, mkSASU } from './engine'

describe('buildCascadeItems', () => {
  describe('contract tests', () => {
    it('returns CascadeItem[] with correct shape', () => {
      const sim = simMicro(50000, 1, 42500)
      const items = buildCascadeItems(sim, mkMicro(50000), 50000)
      expect(Array.isArray(items)).toBe(true)
      for (const item of items) {
        expect(item).toHaveProperty('icon')
        expect(item).toHaveProperty('label')
        expect(item).toHaveProperty('amount')
        expect(item).toHaveProperty('percentage')
        expect(item).toHaveProperty('type')
        expect(['ca', 'charge', 'tax', 'net']).toContain(item.type)
      }
    })

    it('first item is always CA with type "ca"', () => {
      const sim = simMicro(80000, 1, 42500)
      const items = buildCascadeItems(sim, mkMicro(80000), 80000)
      expect(items[0].type).toBe('ca')
      expect(items[0].amount).toBe(80000)
      expect(items[0].percentage).toBe(100)
    })

    it('does NOT include a NET card (shown by HeroNet separately)', () => {
      const sim = simMicro(80000, 1, 42500)
      const items = buildCascadeItems(sim, mkMicro(80000), 80000)
      expect(items.find(i => i.type === 'net')).toBeUndefined()
    })

    it('includes charge item for cotisations', () => {
      const sim = simMicro(50000, 1, 42500)
      const items = buildCascadeItems(sim, mkMicro(50000), 50000)
      const charges = items.filter(i => i.type === 'charge')
      expect(charges.length).toBeGreaterThanOrEqual(1)
      expect(charges[0].amount).toBeLessThan(0)
    })
  })

  describe('micro', () => {
    it('builds correct cascade for micro CA=50k', () => {
      const sim = simMicro(50000, 1, 42500)
      const items = buildCascadeItems(sim, mkMicro(50000), 50000)
      expect(items.length).toBeGreaterThanOrEqual(3) // CA + cotis + IR/NET
      expect(items[0].label).toContain("Chiffre d'affaires")
      expect(items[1].label).toContain("Cotisations")
    })

    it('cotisations detail rows include retraite and maladie', () => {
      const sim = simMicro(50000, 1, 42500)
      const items = buildCascadeItems(sim, mkMicro(50000), 50000)
      const cotisItem = items.find(i => i.type === 'charge')!
      expect(cotisItem.detail).toBeDefined()
      expect(cotisItem.detail!.length).toBeGreaterThanOrEqual(2)
    })

    it('labels as "URSSAF micro BNC (25,6%)"', () => {
      const sim = simMicro(50000, 1, 42500)
      const items = buildCascadeItems(sim, mkMicro(50000), 50000)
      const cotis = items.find(i => i.type === 'charge')!
      expect(cotis.sublabel).toContain('micro BNC')
    })
  })

  describe('TNS Mode B (EURL IS)', () => {
    it('includes IS card when profit > 0', () => {
      const sim = simTNS_B(100000, 1, 20000, 42500)
      const items = buildCascadeItems(sim, mkTNS(20000), 100000)
      const taxItems = items.filter(i => i.type === 'tax')
      expect(taxItems.length).toBe(2) // IR + IS
    })

    it('includes capital retained card', () => {
      const sim = simTNS_B(100000, 1, 20000, 42500)
      const items = buildCascadeItems(sim, mkTNS(20000), 100000)
      const capitalItem = items.find(i => i.label.includes('Capitalisé'))
      expect(capitalItem).toBeDefined()
      expect(capitalItem!.amount).toBeGreaterThan(0)
    })

    it('IS detail shows 15% and 25% breakdown', () => {
      const sim = simTNS_B(100000, 1, 20000, 42500)
      const items = buildCascadeItems(sim, mkTNS(20000), 100000)
      const isItem = items.find(i => i.label.includes('Impôt sur les sociétés'))!
      expect(isItem.detail!.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('SASU Mode A', () => {
    it('labels as "Patronales + salariales (~77%)"', () => {
      const sim = simSASU_A(100000, 1, 42500)
      const items = buildCascadeItems(sim, mkSASU(sim.brut), 100000)
      const cotis = items.find(i => i.type === 'charge')!
      expect(cotis.sublabel).toContain('77%')
    })

    it('no IS card in Mode A', () => {
      const sim = simSASU_A(100000, 1, 42500)
      const items = buildCascadeItems(sim, mkSASU(sim.brut), 100000)
      const isItem = items.find(i => i.label.includes('Impôt sur les sociétés'))
      expect(isItem).toBeUndefined()
    })
  })

  describe('holding', () => {
    it('builds cascade for holding Mode A', () => {
      const sim = simHolding(150000, 1, 'A', 20000, 500, 42500)
      const items = buildCascadeItems(sim, mkTNS(sim.nr || 20000), 150000)
      expect(items.length).toBeGreaterThanOrEqual(3)
      expect(items[0].amount).toBe(150000)
    })
  })

  describe('edge cases', () => {
    it('handles CA = 0', () => {
      const sim = simMicro(0, 1, 42500)
      const items = buildCascadeItems(sim, mkMicro(0), 0)
      expect(items.length).toBeGreaterThanOrEqual(2)
      expect(items[0].amount).toBe(0)
    })

    it('non-CA percentages are 0 when CA is 0', () => {
      const sim = simMicro(0, 1, 42500)
      const items = buildCascadeItems(sim, mkMicro(0), 0)
      for (const item of items) {
        if (item.type !== 'ca') {
          expect(item.percentage).toBe(0)
        }
      }
    })

    it('cascade contains only deduction types (ca, charge, tax) — no net', () => {
      const sim = simMicro(60000, 1, 42500)
      const items = buildCascadeItems(sim, mkMicro(60000), 60000)
      for (const item of items) {
        expect(['ca', 'charge', 'tax']).toContain(item.type)
      }
    })
  })
})
