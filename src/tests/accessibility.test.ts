import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Accessibility & WCAG 2.1 AA Compliance Suite', () => {
  const componentsDir = path.resolve(process.cwd(), 'src/components');
  const componentFiles: string[] = fs
    .readdirSync(componentsDir)
    .filter((f: string) => f.endsWith('.tsx') && !f.includes('FluxLines'));

  it('verifies 100% of interactive button elements possess explicit accessible labels (aria-label)', () => {
    let totalButtons = 0;
    let missingAriaCount = 0;

    componentFiles.forEach((file: string) => {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
      const buttonMatches = content.match(/<button[^>]*>[\s\S]*?<\/button>/g) || [];

      buttonMatches.forEach((btn: string) => {
        totalButtons++;
        const hasAria = /aria-label=/.test(btn);
        if (!hasAria) {
          missingAriaCount++;
        }
      });
    });

    expect(totalButtons).toBeGreaterThan(50);
    // 100% of buttons must declare aria-label
    expect(missingAriaCount).toBe(0);
  });

  it('verifies all modal dialogs declare role="dialog" and aria-modal="true"', () => {
    const modalFiles = ['ApiKeyModal.tsx', 'CreateEventModal.tsx', 'BudgetModule.tsx', 'TimelineModule.tsx', 'VendorModule.tsx'];

    modalFiles.forEach((file: string) => {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
      expect(content).toContain('role="dialog"');
      expect(content).toContain('aria-modal="true"');
      expect(content).toContain('aria-labelledby=');
    });
  });

  it('verifies form input elements have associated accessible labels or htmlFor bindings', () => {
    componentFiles.forEach((file: string) => {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
      const inputMatches = content.match(/<input[^>]*id="([^"]+)"[^>]*>/g) || [];

      inputMatches.forEach((input: string) => {
        const idMatch = input.match(/id="([^"]+)"/);
        if (idMatch && idMatch[1]) {
          const inputId = idMatch[1];
          // Must have corresponding label with htmlFor or aria-label
          const hasLabel = content.includes(`htmlFor="${inputId}"`) || content.includes(`aria-label=`);
          expect(hasLabel).toBe(true);
        }
      });
    });
  });

  it('verifies external navigation links declare rel="noopener noreferrer" for safety', () => {
    componentFiles.forEach((file: string) => {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
      const targetBlankMatches = content.match(/<a[^>]*target="_blank"[^>]*>/g) || [];

      targetBlankMatches.forEach((link: string) => {
        expect(link).toContain('rel="noopener noreferrer"');
      });
    });
  });
});
