import { parse } from "../cssParser.ts";
import { assertObjectMatch } from "https://deno.land/std@0.150.0/testing/asserts.ts";

Deno.test("simple css", () => {
  const result = parse(`
        h1 {
          color: red;
        }
  `);
  assertObjectMatch(result, {
    rules: [
      {
        selectors: [
          {
            type: "tag",
            name: "h1",
          },
        ],
        declarations: [
          {
            name: "color",
            value: "red",
          },
        ],
      },
    ],
  });
});

Deno.test("multiple css", () => {
  const result = parse(`
        td {
          display: block;
        }
        h1, .foo, #aaa {
          color: red;
          font-size: 1em;
        }
  `);
  assertObjectMatch(result, {
    rules: [
      {
        selectors: [
          {
            type: "tag",
            name: "td",
          },
        ],
        declarations: [
          {
            name: "display",
            value: "block",
          },
        ],
      },
      {
        selectors: [
          {
            type: "tag",
            name: "h1",
          },
          {
            type: "class",
            name: "foo",
          },
          {
            type: "id",
            name: "aaa",
          },
        ],
        declarations: [
          {
            name: "color",
            value: "red",
          },
          {
            name: "font-size",
            value: [1, "em"],
          },
        ],
      },
    ],
  });
});
