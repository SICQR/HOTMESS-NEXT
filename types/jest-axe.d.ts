declare module 'jest-axe' {
  interface AxeResultViolationNode {
    target: string[];
    html: string;
  }
  interface AxeResultViolation {
    id: string;
    impact?: string;
    description: string;
    help: string;
    helpUrl: string;
    nodes: AxeResultViolationNode[];
  }
  interface AxeResults {
    violations: AxeResultViolation[];
    passes: AxeResultViolation[];
    incomplete: AxeResultViolation[];
  }
  export function axe(node: Element | Document): Promise<AxeResults>;
}

declare namespace jest {
  interface Matchers<R> {
    toHaveNoViolations(): R;
  }
}
