/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";

export default function BrowserMockup(
  { children }: { children: h.JSX.Element },
) {
  return (
    <div>
      <div
        class={tw`w-full h-11 rounded-t-lg bg-gray-200 flex justify-start items-center space-x-1.5 px-3`}
      >
        <span class={tw`w-3 h-3 rounded-full bg-red-400`}></span>
        <span class={tw`w-3 h-3 rounded-full bg-yellow-400`}></span>
        <span class={tw`w-3 h-3 rounded-full bg-green-400`}></span>
      </div>
      <div class={tw`bg-gray-200 p-[2px] overflow-x-scroll`}>
        <div class={tw`bg-white border-t-0 w-[700px] h-[400x]`}>
          {children}
        </div>
      </div>
    </div>
  );
}
