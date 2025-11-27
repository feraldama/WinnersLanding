import svgPaths from "./svg-z8vmvlzbkt";

function WinnerVector() {
  return (
    <div className="relative shrink-0 size-[47.935px]" data-name="winner vector 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="winner vector 1">
          <path d={svgPaths.p12173980} fill="var(--fill-0, #FE9709)" id="Vector" stroke="var(--stroke-0, #FE9709)" strokeWidth="0.0620537" />
          <path d={svgPaths.p31fa7c80} fill="var(--fill-0, #FE9709)" id="Vector_2" stroke="var(--stroke-0, #FE9709)" strokeWidth="0.0620537" />
          <path d={svgPaths.pa107080} fill="var(--fill-0, #FE9709)" id="Vector_3" stroke="var(--stroke-0, #FE9709)" strokeWidth="0.0620537" />
          <path d={svgPaths.p3f997980} fill="var(--fill-0, #FE9709)" id="Vector_4" stroke="var(--stroke-0, #FE9709)" strokeWidth="0.0620537" />
        </g>
      </svg>
    </div>
  );
}

function CharmMenuHamburger() {
  return (
    <div className="relative shrink-0 size-[20.087px]" data-name="charm:menu-hamburger">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 21">
        <g id="charm:menu-hamburger">
          <path d={svgPaths.p188fb700} id="Vector" stroke="var(--stroke-0, #FE9709)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.88315" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="box-border content-stretch flex gap-[12.554px] items-center justify-center p-[12.554px] relative shrink-0">
      <CharmMenuHamburger />
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="bg-black relative rounded-[8.902px] size-full">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex items-center justify-between px-[10.272px] py-[7.533px] relative size-full">
          <WinnerVector />
          <Frame />
        </div>
      </div>
    </div>
  );
}