import imgShadow from "figma:asset/7f12ea1300756f144a0fb5daaf68dbfc01103a46.png";
import imgShadow1 from "figma:asset/e996d2d482dbd5187893919e00a660929d8a6d25.png";

function Shadow() {
  return <div className="absolute h-[553px] left-0 top-0 w-[1920px]" data-name="Shadow" />;
}

function Shadow1() {
  return (
    <div className="absolute h-[540px] left-0 overflow-clip top-0 w-[1920px]" data-name="Shadow">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <img alt="" className="absolute max-w-none object-50%-50% object-cover size-full" src={imgShadow} />
        <img alt="" className="absolute max-w-none object-50%-50% object-cover size-full" src={imgShadow1} />
      </div>
      <Shadow />
    </div>
  );
}

export default function Opcion() {
  return (
    <div className="bg-black relative size-full" data-name="Opcion 4">
      <Shadow1 />
    </div>
  );
}