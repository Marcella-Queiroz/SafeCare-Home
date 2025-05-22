//Logo do sistema
import { Hospital } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo = ({ className = "", showText = true }: LogoProps) => {
  return (
    <div className={`logo-container ${className}`}>
      <Hospital className="logo-icon" />
      {showText && (
        <span className="logo-text">
          SafeCare <span className="logo-home">Home</span>
        </span>
      )}
    </div>
  );
};

export default Logo;