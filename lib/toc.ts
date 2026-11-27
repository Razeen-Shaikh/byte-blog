export type TocItem = { id: string; text: string; level: 2 | 3 };

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function extractTocFromHtml(html: string): TocItem[] {
  const items: TocItem[] = [];
  const regex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  const seen = new Map<string, number>();

  while ((match = regex.exec(html)) !== null) {
    const level = Number(match[1]) as 2 | 3;
    const raw = match[2].replace(/<[^>]+>/g, "").trim();
    if (!raw) continue;
    let id = slugifyHeading(raw);
    const count = seen.get(id) ?? 0;
    if (count > 0) id = `${id}-${count}`;
    seen.set(slugifyHeading(raw), count + 1);
    items.push({ id, text: raw, level });
  }

  return items;
}

export function injectHeadingIds(html: string, toc: TocItem[]): string {
  let index = 0;
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (full, level, attrs, inner) => {
    const item = toc[index];
    index += 1;
    if (!item) return full;
    const hasId = /id\s*=/.test(attrs);
    if (hasId) return full;
    return `<h${level}${attrs} id="${item.id}">${inner}</h${level}>`;
  });
}