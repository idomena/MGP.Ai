import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OCR() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/nutrition", { replace: true }); }, [navigate]);
  return null;
}
