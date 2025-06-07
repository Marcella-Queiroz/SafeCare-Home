//Layout para exibição de métricas de saúde

import { Tooltip, Typography } from "@mui/material";
import { InfoIcon } from "lucide-react";
import { ReactNode } from "react";

interface HealthMetricDisplayProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  tooltipText: string;
}

const HealthMetricDisplay = ({
  title,
  tooltipText,
  icon,
  children,
}: HealthMetricDisplayProps) => {
  return (
    <>
        {/* Título com ícone e tooltip */}

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {icon}
          {title}
          <Tooltip
            title={tooltipText}
            placement="top"
            arrow
            sx={{ display: "inline-flex", alignItems: "center", ml: 1 }}
          >
            <InfoIcon
              style={{
                color: "#888",
                cursor: "pointer",
                verticalAlign: "middle",
                marginLeft: "10px",
              }}
            />
          </Tooltip>
        </Typography>

      {children}
    </>
  );
};

export default HealthMetricDisplay;
