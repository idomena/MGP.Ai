import logoImage from "@/assets/logo.png";

export default function Logo() {
  return (
    <div className="text-center">
      <img
        src={logoImage}
        alt="MGP.AI Logo"
        className="h-10 w-auto"
      />
    </div>
  );
}
