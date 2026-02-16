const fs = require("fs")
const files = [
  "app/profile/client/page.tsx",
  "app/profile/lounge/page.tsx",
  "app/centers/[id]/page.tsx",
]
for (const p of files) {
  const s = fs.readFileSync(p, "utf8")
  const counts = {
    divOpen: (s.match(/<div(\s|>)/g) || []).length,
    divClose: (s.match(/<\/div>/g) || []).length,
    errOpen: (s.match(/<ErrorBoundary>/g) || []).length,
    errClose: (s.match(/<\/ErrorBoundary>/g) || []).length,
    jsxOpen: (s.match(/</g) || []).length,
    jsxClose: (s.match(/>/g) || []).length,
  }
  console.log(p, counts)
}
