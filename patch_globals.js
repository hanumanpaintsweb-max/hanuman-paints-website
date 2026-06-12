const fs = require('fs');

const cssPath = 'src/app/globals.css';
let css = fs.readFileSync(cssPath, 'utf8');

const themeInjection = `
  /* STITCH ADMIN REDESIGN TOKENS */
  --color-primary-fixed: #dce1ff;
  --color-outline: #757682;
  --color-on-tertiary-fixed-variant: #005236;
  --color-tertiary: #00311f;
  --color-surface-container-high: #e2e7ff;
  --color-surface: #faf8ff;
  --color-on-primary: #ffffff;
  --color-on-error: #ffffff;
  --color-tertiary-fixed-dim: #4edea3;
  --color-secondary: #9d4300;
  --color-on-secondary-fixed-variant: #783200;
  --color-surface-container-lowest: #ffffff;
  --color-primary-fixed-dim: #b6c4ff;
  --color-primary: #00236f;
  --color-on-secondary: #ffffff;
  --color-inverse-surface: #283044;
  --color-surface-tint: #4059aa;
  --color-on-primary-fixed-variant: #264191;
  --color-secondary-container: #fd761a;
  --color-surface-container-highest: #dae2fd;
  --color-on-tertiary-container: #27c38a;
  --color-on-surface-variant: #444651;
  --color-surface-dim: #d2d9f4;
  --color-primary-container: #1e3a8a;
  --color-on-tertiary-fixed: #002113;
  --color-on-tertiary: #ffffff;
  --color-on-secondary-fixed: #341100;
  --color-error: #ba1a1a;
  --color-on-background: #131b2e;
  --color-secondary-fixed-dim: #ffb690;
  --color-tertiary-container: #004a31;
  --color-surface-container: #eaedff;
  --color-inverse-primary: #b6c4ff;
  --color-surface-variant: #dae2fd;
  --color-surface-container-low: #f2f3ff;
  --color-on-primary-fixed: #00164e;
  --color-on-primary-container: #90a8ff;
  --color-on-error-container: #93000a;
  --color-tertiary-fixed: #6ffbbe;
  --color-outline-variant: #c5c5d3;
  --color-inverse-on-surface: #eef0ff;
  --color-surface-bright: #faf8ff;
  --color-on-surface: #131b2e;
  --color-on-secondary-container: #5c2400;
  --color-error-container: #ffdad6;
  --color-secondary-fixed: #ffdbca;
  --color-background: #faf8ff;

  --spacing-stack-margin: 1rem;
  --spacing-sidebar-width: 280px;
  --spacing-container-padding: 1.5rem;
  --spacing-element-gap: 1.5rem;

  --font-headline-lg: "Inter", sans-serif;
  --font-headline-md: "Inter", sans-serif;
  --font-body-lg: "Inter", sans-serif;
  --font-headline-lg-mobile: "Inter", sans-serif;
  --font-label-md: "Inter", sans-serif;
  --font-headline-sm: "Inter", sans-serif;
  --font-body-md: "Inter", sans-serif;
  
  --text-headline-lg: 30px;
  --text-headline-lg--line-height: 38px;
  --text-headline-lg--letter-spacing: -0.02em;
  --text-headline-lg--font-weight: 700;

  --text-headline-md: 24px;
  --text-headline-md--line-height: 32px;
  --text-headline-md--letter-spacing: -0.01em;
  --text-headline-md--font-weight: 600;

  --text-body-lg: 16px;
  --text-body-lg--line-height: 24px;
  --text-body-lg--font-weight: 400;

  --text-headline-lg-mobile: 24px;
  --text-headline-lg-mobile--line-height: 32px;
  --text-headline-lg-mobile--font-weight: 700;

  --text-label-md: 12px;
  --text-label-md--line-height: 16px;
  --text-label-md--letter-spacing: 0.05em;
  --text-label-md--font-weight: 600;

  --text-headline-sm: 20px;
  --text-headline-sm--line-height: 28px;
  --text-headline-sm--font-weight: 600;

  --text-body-md: 14px;
  --text-body-md--line-height: 20px;
  --text-body-md--font-weight: 400;
`;

if (!css.includes('--color-primary-fixed')) {
  css = css.replace('@theme inline {', '@theme inline {' + themeInjection);
  
  // also add the Inter font import at the top
  const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');\n`;
  css = fontImport + css;
  
  fs.writeFileSync(cssPath, css);
  console.log("globals.css updated with redesign tokens!");
} else {
  console.log("Tokens already exist in globals.css");
}
