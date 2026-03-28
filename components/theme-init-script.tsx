// Inline script to apply saved theme before first paint (avoids flash)
// This is a Server Component – no 'use client' needed.
export function ThemeInitScript() {
  const script = `
    (function() {
      try {
        var t = localStorage.getItem('bloomscroll-theme') || 'dark';
        var valid = ['dark','light','sunny','moonshine'];
        if (!valid.includes(t)) t = 'dark';
        document.documentElement.classList.add(t);
      } catch(e) {
        document.documentElement.classList.add('dark');
      }
    })();
  `
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional theme init
      dangerouslySetInnerHTML={{ __html: script }}
    />
  )
}
