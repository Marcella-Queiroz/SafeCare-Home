
import { Hospital } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo = ({ className = "", showText = true }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Hospital className="h-6 w-6 text-safecare-600" />
      {showText && (
        <span className="font-bold text-lg text-safecare-700">
          SafeCare <span className="text-success-600">Home</span>
        </span>
      )}
    </div>
  );
};

export default Logo;