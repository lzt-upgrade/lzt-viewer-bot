import { test, expect, describe } from "bun:test";
import { extractFirstImage } from "../src/core/bbcode";

describe("extract first image", () => {
  const expected = "https://example.com/image.jpg";

  test("default", () => {
    expect(extractFirstImage(`[img]${expected}[/img]`)).toBe(expected);
  });

  test("nested tags", () => {
    expect(extractFirstImage(`[b][img]${expected}[/img][/b]`)).toBe(expected);
  });

  test("uppercase tags", () => {
    expect(extractFirstImage(`[B][IMG]${expected}[/IMG][/B]`)).toBe(expected);
  });

  test("2+ img tags", () => {
    expect(extractFirstImage(`[B][IMG]${expected}[/IMG][/B][IMG]https://fake.com[/IMG]`)).toBe(
      expected,
    );
  });

  test("with attrs", () => {
    const expected2 = "https://nztcdn.com/files/e6451b8a-a787-4564-9289-057f5dd32ef3.webp";
    expect(
      extractFirstImage(
        `[CENTER]

[URL='https://t.me/XomiachiyNovostnik'][IMG=align=left;alt=%5BIMG%5D]https://nztcdn.com/files/e6451b8a-a787-4564-9289-057f5dd32ef3.webp[/IMG][/URL]

[SIZE=7][URL="https://t.me/XomiachiyNovostnik"]https://t.me/XomiachiyNovostnik[/URL]

[URL="https://t.me/XomiachiyNovostnik"]https://t.me/XomiachiyNovostnik[/URL]

[URL="https://t.me/XomiachiyNovostnik"]https://t.me/XomiachiyNovostnik[/URL]  [/SIZE]
[IMG=align=left;alt=%5BIMG%5D]https://nztcdn.com/files/68a12313-75da-49e5-ae17-7160829d4f8d.webp[/IMG][/CENTER]
[spoiler=редакторности;align=center][CENTER][USER=2253224]@Erna[/USER]  [USER=4132001]@панан[/USER]  [USER=3587292]@Wysanne[/USER] [SIZE=13px] [USER=5273698]@Ironically[/USER] [USER=3866619]@Alexis[/USER]   [USER=7640548]@Welhord[/USER] [USER=4155563]@ПитерГриффин[/USER] [USER=2942054]@llimonix[/USER]  [USER=6885707]@Tendrly[/USER] [USER=2243751]@unblock[/USER]  [USER=5680221]@Emiru[/USER]  [USER=5084998]@foxynesss[/USER] [USER=6952969]@KitMarder[/USER] [USER=4371674]@камару[/USER] [USER=668968]@K1ERRY[/USER] [/SIZE][/CENTER][/spoiler]
[CENTER]


[/CENTER]`,
      ),
    ).toBe(expected2);
  });
});
