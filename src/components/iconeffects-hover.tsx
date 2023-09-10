type iconeffectsprops = {
  children: React.ReactNode;
  red: boolean;
};

export function IconEffectsHover({ children, red = false }: iconeffectsprops) {
  const coloreffectclass = red
    ? "hover:bg-red-200 outline-red-400 group-hover:bg-red-200 group-focus-visible:bg-red-200 focus-visible:bg-red-200"
    : "hover:bg-gray-200 outline-grey-400 group-hover:bg-gray-200 group-focus-visible:bg-gray-200";

  return (
    <div
      className={`w-max rounded-full p-2 transition-colors duration-200 ${coloreffectclass}`}
    >
      {children}
    </div>
  );
}
